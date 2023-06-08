import { useMemo } from 'react';

import {
  DataCollectionStage,
  useGetEnrollmentAssessmentsQuery,
  AssessmentRole,
} from '@/types/gqlTypes';

/**
 * Get the most recent assessments for the given enrollment
 */
export function useRecentAssessments(enrollmentId: string) {
  const { data, loading, error } = useGetEnrollmentAssessmentsQuery({
    variables: {
      id: enrollmentId,
      filters: {
        role: [
          AssessmentRole.Intake,
          AssessmentRole.Exit,
          AssessmentRole.Annual,
        ],
      },
      limit: 50,
    },
    fetchPolicy: 'cache-and-network',
  });

  if (error) throw error;

  const [intake, exit, annual] = useMemo(() => {
    if (!data) return [];
    const assessments = data.enrollment?.assessments?.nodes || [];
    const intake = assessments.find(
      (a) => a.dataCollectionStage === DataCollectionStage.ProjectEntry
    );
    const exit = assessments.find(
      (a) => a.dataCollectionStage === DataCollectionStage.ProjectExit
    );
    const annual = assessments.find(
      (a) => a.dataCollectionStage === DataCollectionStage.AnnualAssessment
    );
    return [intake, exit, annual];
  }, [data]);

  return { intake, exit, annual, loading };
}
