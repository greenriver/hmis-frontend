import { startCase } from 'lodash-es';
import { useMemo } from 'react';

import {
  applyDataCollectedAbout,
  ClientNameDobVeteranFields,
} from '@/modules/form/util/formUtil';
import {
  FormDefinitionJson,
  FormRole,
  FullAssessmentFragment,
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
  const definition = useMemo(() => {
    const formDef =
      formDefinitionData?.getFormDefinition?.definition ||
      assessmentData?.assessment?.definition;
    if (!formDef) return;
    const mutable = { ...formDef };
    mutable.item = applyDataCollectedAbout(
      formDef.item,
      client,
      relationshipToHoH
    );
    return mutable;
  }, [formDefinitionData, assessmentData, client, relationshipToHoH]);

  const [formRole, assessmentTitle] = useMemo(() => {
    const arole = assessmentData?.assessment?.role || formRoleParam;
    return [arole, `${arole ? startCase(arole.toLowerCase()) : ''} Assessment`];
  }, [assessmentData, formRoleParam]);

  if (formDefinitionError) throw formDefinitionError;
  if (assessmentError) throw assessmentError;

  return {
    assessmentTitle,
    formRole,
    definition,
    definitionId:
      assessmentData?.assessment?.definitionId ||
      formDefinitionData?.getFormDefinition?.id,
    assessment: assessmentData?.assessment,
    loading: formDefinitionLoading || assessmentLoading,
  } as {
    assessmentTitle: string;
    formRole?: FormRole;
    definitionId?: string;
    definition?: FormDefinitionJson;
    assessment?: FullAssessmentFragment;
    loading: boolean;
  };
}
