import { useMemo } from 'react';

import {
  applyDefinitionRulesForClient,
  getItemMap,
} from '../../form/util/formUtil';

import {
  AssessmentRole,
  ClientNameDobVetFragment,
  RelationshipToHoH,
  useGetAssessmentFormDefinitionQuery,
} from '@/types/gqlTypes';

interface Args {
  // Project, for rule filtering
  projectId: string;
  // ID, if looking up FormDefinition by ID
  formDefinitionId?: string;
  // AssessmentRole, if looking up FormDefiniton by Role
  role?: AssessmentRole;
  // Assessment date, for rule filtering
  assessmentDate?: string | null;
  // Optional, to apply "Data Collected About" rules
  client?: ClientNameDobVetFragment;
  // Optional, to apply "Data Collected About" rules
  relationshipToHoH?: RelationshipToHoH;
}

/**
 * Fetch FormDefinition to use for an Assessment.
 */
const useAssessmentFormDefinition = ({
  projectId,
  formDefinitionId,
  role,
  assessmentDate,
  client,
  relationshipToHoH,
}: Args) => {
  // Note: since there are 2 ways of looking up a form definition for an assessment
  // (by role or by ID), we don't get effective cacheing here. In some cases we will
  // fetch even though we already have the definition in the cache. That could be
  // optimized but we may need to read/write directly from the cache based on the `cacheKey`
  // for the definition, which is a string formatted like: <id|projectId|date>

  const { data, loading, error } = useGetAssessmentFormDefinitionQuery({
    variables: {
      projectId,
      id: formDefinitionId,
      role,
      assessmentDate,
    },
  });

  const { formDefinition, itemMap } = useMemo(() => {
    // Find the definition that we actually have
    let formDefinition = data?.assessmentFormDefinition;
    if (!formDefinition) return {};

    // If we have a Client, apply the DataCollectedAbout rules
    if (client) {
      formDefinition = applyDefinitionRulesForClient(
        formDefinition,
        client,
        relationshipToHoH || RelationshipToHoH.DataNotCollected
      );
    }

    return {
      formDefinition,
      // Generate ItemMap for convenience
      itemMap: getItemMap(formDefinition.definition, false),
    };
  }, [data, client, relationshipToHoH]);

  if (error)
    throw new Error(
      `Failed to fetch form definition: ${formDefinitionId || role || ''}`
    );

  return { formDefinition, itemMap, loading };
};

export default useAssessmentFormDefinition;
