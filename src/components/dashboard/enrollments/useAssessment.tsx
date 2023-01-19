import { startCase } from 'lodash-es';
import { useMemo } from 'react';

import useSafeParams from '@/hooks/useSafeParams';
import {
  AssessmentRole,
  AssessmentWithDefinitionAndValuesFragment,
  FormDefinition,
  useGetAssessmentQuery,
  useGetFormDefinitionQuery,
} from '@/types/gqlTypes';

export function useAssessment() {
  const {
    enrollmentId,
    assessmentId,
    assessmentRole: assessmentRoleParam,
  } = useSafeParams() as {
    clientId: string;
    enrollmentId: string;
    // If editing, we have the assessment ID.
    // If create new, we have the role.
    assessmentId?: string;
    assessmentRole?: string;
  };
  const role = useMemo(() => {
    if (!assessmentRoleParam) return;
    if (
      !Object.values<string>(AssessmentRole).includes(
        assessmentRoleParam.toUpperCase()
      )
    ) {
      // should be 404
      throw Error(`Unrecognized role ${assessmentRoleParam}`);
    }
    return assessmentRoleParam.toUpperCase() as AssessmentRole;
  }, [assessmentRoleParam]);

  const {
    data: formDefinitionData,
    loading: formDefinitionLoading,
    error: formDefinitionError,
  } = useGetFormDefinitionQuery({
    variables: {
      enrollmentId,
      assessmentRole: role as AssessmentRole,
    },
    skip: !role, // skip if editing an existing assessment
  });

  const {
    data: assessmentData,
    loading: assessmentLoading,
    error: assessmentError,
  } = useGetAssessmentQuery({
    variables: { id: assessmentId as string },
    skip: !assessmentId, // skip if creating a new assessment
  });

  const definition = useMemo(
    () =>
      formDefinitionData?.getFormDefinition ||
      assessmentData?.assessment?.assessmentDetail?.definition,
    [formDefinitionData, assessmentData]
  );

  const [assessmentRole, assessmentTitle] = useMemo(() => {
    const arole = assessmentData?.assessment?.assessmentDetail?.role || role;
    return [arole, `${arole ? startCase(arole.toLowerCase()) : ''} Assessment`];
  }, [assessmentData, role]);

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
