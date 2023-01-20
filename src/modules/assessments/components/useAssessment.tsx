import { startCase } from 'lodash-es';
import { useMemo } from 'react';

import {
  AssessmentRole,
  AssessmentWithDefinitionAndValuesFragment,
  FormDefinition,
  useGetAssessmentQuery,
  useGetFormDefinitionQuery,
} from '@/types/gqlTypes';

export function useAssessment(
  enrollmentId: string,
  // If editing, we have the assessment ID.
  assessmentId?: string,
  // If create new, we have the role.
  assessmentRoleParam?: AssessmentRole
) {
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
    // FIXME: for now always use network because theh response depends on the enrollment details (HoH status, age status, etc)
    // Should figure out a way to cache when possible
    fetchPolicy: 'cache-and-network',
    onCompleted: (data) => {
      console.log('fetched fd for', enrollmentId, data);
    },
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
