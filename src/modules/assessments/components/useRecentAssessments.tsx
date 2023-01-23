import { useMemo } from 'react';

import {
  AssessmentRole,
  useGetEnrollmentAssessmentsQuery,
} from '@/types/gqlTypes';

/**
 * Get the most recent assessments for the given enrollment
 */
export function useRecentAssessments(enrollmentId: string) {
  const { data, loading, error } = useGetEnrollmentAssessmentsQuery({
    variables: {
      id: enrollmentId,
      roles: [
        AssessmentRole.Intake,
        AssessmentRole.Exit,
        AssessmentRole.Annual,
      ],
      limit: 50,
    },
    fetchPolicy: 'cache-and-network',
  });

  if (error) throw error;

  const [intake, exit, annual] = useMemo(() => {
    if (!data) return [];
    const assessments = data.enrollment?.assessments?.nodes || [];
    const intake = assessments.find(
      (a) => a.assessmentDetail?.role === AssessmentRole.Intake
    );
    const exit = assessments.find(
      (a) => a.assessmentDetail?.role === AssessmentRole.Exit
    );
    const annual = assessments.find(
      (a) => a.assessmentDetail?.role === AssessmentRole.Annual
    );
    return [intake, exit, annual];
  }, [data]);

  return { intake, exit, annual, loading };
}
