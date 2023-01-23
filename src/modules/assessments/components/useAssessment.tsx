import { startCase } from 'lodash-es';
import { useMemo } from 'react';

import {
  applyDataCollectedAbout,
  ClientNameDobVeteranFields,
} from '@/modules/form/util/formUtil';
import {
  AssessmentRole,
  AssessmentWithDefinitionAndValuesFragment,
  FormDefinition,
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
  assessmentRoleParam?: AssessmentRole;
};

export function useAssessment({
  enrollmentId,
  relationshipToHoH,
  client,
  assessmentId,
  assessmentRoleParam,
}: Args) {
  const {
    data: formDefinitionData,
    loading: formDefinitionLoading,
    error: formDefinitionError,
  } = useGetFormDefinitionQuery({
    variables: {
      enrollmentId,
      assessmentRole: assessmentRoleParam as AssessmentRole,
    },
    // skip if editing an existing assessment
    skip: !assessmentRoleParam,
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
      formDefinitionData?.getFormDefinition ||
      assessmentData?.assessment?.assessmentDetail?.definition;
    if (!formDef) return;
    const mutable = { ...formDef };
    mutable.definition.item = applyDataCollectedAbout(
      formDef.definition.item,
      client,
      relationshipToHoH
    );
    return mutable;
  }, [formDefinitionData, assessmentData, client, relationshipToHoH]);

  const [assessmentRole, assessmentTitle] = useMemo(() => {
    const arole =
      assessmentData?.assessment?.assessmentDetail?.role || assessmentRoleParam;
    return [arole, `${arole ? startCase(arole.toLowerCase()) : ''} Assessment`];
  }, [assessmentData, assessmentRoleParam]);

  if (formDefinitionError) throw formDefinitionError;
  if (assessmentError) throw assessmentError;

  return {
    assessmentTitle,
    assessmentRole,
    definition,
    assessment: assessmentData?.assessment,
    loading: formDefinitionLoading || assessmentLoading,
  } as {
    assessmentTitle: string;
    assessmentRole?: AssessmentRole;
    definition?: FormDefinition;
    assessment?: AssessmentWithDefinitionAndValuesFragment;
    loading: boolean;
  };
}
