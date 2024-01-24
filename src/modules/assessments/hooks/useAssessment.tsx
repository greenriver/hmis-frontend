import { useMemo } from 'react';

import {
  applyDefinitionRulesForClient,
  ClientNameDobVeteranFields,
} from '@/modules/form/util/formUtil';
import {
  FormDefinitionFieldsFragment,
  FormRole,
  RelationshipToHoH,
  useGetAssessmentQuery,
  useGetFormDefinitionQuery,
} from '@/types/gqlTypes';

type Args = {
  enrollmentId: string;
  relationshipToHoH: RelationshipToHoH;
  client: ClientNameDobVeteranFields;
  // If editing, we have the assessment ID.
  assessmentId?: string;
  // If create new, we have the role.
  formRoleParam?: FormRole;
};

export function useAssessment({
  enrollmentId,
  relationshipToHoH,
  client,
  assessmentId,
  formRoleParam,
}: Args) {
  const {
    data: formDefinitionData,
    loading: formDefinitionLoading,
    error: formDefinitionError,
  } = useGetFormDefinitionQuery({
    variables: {
      enrollmentId,
      role: formRoleParam as FormRole,
    },
    // skip if editing an existing assessment
    skip: !formRoleParam,
  });

  const {
    data: assessmentData,
    loading: assessmentLoading,
    error: assessmentError,
  } = useGetAssessmentQuery({
    variables: { id: assessmentId as string },
    skip: !assessmentId, // skip if creating a new assessment
  });

  // Apply "Data Collected About" conditionals to form definition based on client details.
  // I.E. drop irrelevant item groups for children, non-HOH, non-Veterans, etc
  const definition: FormDefinitionFieldsFragment | undefined = useMemo(() => {
    const formDef =
      formDefinitionData?.getFormDefinition ||
      assessmentData?.assessment?.definition;
    if (!formDef) return;

    return applyDefinitionRulesForClient(formDef, client, relationshipToHoH);
  }, [formDefinitionData, assessmentData, client, relationshipToHoH]);

  if (formDefinitionError) throw formDefinitionError;
  if (assessmentError) throw assessmentError;

  return {
    assessmentTitle: definition?.title || 'Assessment',
    formRole: (definition?.role || formRoleParam) as FormRole,
    definition,
    assessment: assessmentData?.assessment || undefined,
    loading: formDefinitionLoading || assessmentLoading,
  } as const;
}
