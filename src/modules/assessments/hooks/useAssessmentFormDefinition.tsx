import { useMemo } from 'react';

import { getItemMap } from '@/modules/form/util/formUtil';

import {
  AssessmentRole,
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
}

/**
 * Fetch the FormDefinition to use for performing a NEW Assessment.
 */
const useAssessmentFormDefinition = ({
  projectId,
  formDefinitionId,
  role,
  assessmentDate,
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
    const formDefinition = data?.assessmentFormDefinition;
    if (!formDefinition) return {};

    return {
      formDefinition,
      // Generate ItemMap for convenience
      itemMap: getItemMap(formDefinition.definition, false),
    };
  }, [data]);

  if (error) throw error;

  return { formDefinition, itemMap, loading };
};

export default useAssessmentFormDefinition;
