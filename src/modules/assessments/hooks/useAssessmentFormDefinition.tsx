import { useMemo } from 'react';

import {
  applyDefinitionRulesForClient,
  getItemMap,
} from '../../form/util/formUtil';

import { formatDateForGql } from '@/modules/hmis/hmisUtil';
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
  // Skip queries
  skip?: boolean;
  // Optional, to apply "Data Collected About" rules
  client?: ClientNameDobVetFragment;
  // Optional, to apply "Data Collected About" rules
  relationshipToHoH?: RelationshipToHoH;
}

/**
 * There are 2 primary ways to find a Form Definition:
 * 1. Look up by ID. This is used for custom assessments.
 * 2. Look up by "role" context. This is used for most lookups.
 *     It will return the most relevant form for the given role and context.
 *
 * This hook also provides an option for passing a local definition which
 * will bypass all queries.
 *
 * If Client details are passed, this hook will apply DataCollectedAbout conditions,
 * so irrelevant questions are removed from the resulting definition.
 */
const useAssessmentFormDefinition = ({
  projectId,
  formDefinitionId,
  role,
  assessmentDate,
  skip,
  client,
  relationshipToHoH,
}: Args) => {
  // Get definition from cache if we have it

  const { data, loading, error } = useGetAssessmentFormDefinitionQuery({
    variables: {
      projectId,
      id: formDefinitionId,
      role,
      assessmentDate,
    },
    skip,
  });
  if (loading) console.log('fetching by', formDefinitionId, role);

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

  if (formDefinition)
    console.log('fetched', formDefinition.cacheKey, 'its in the cache...');
  return { formDefinition, itemMap, loading };
};

export default useAssessmentFormDefinition;
