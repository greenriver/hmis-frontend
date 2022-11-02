import { QueryResult } from '@apollo/client';
import { useMemo } from 'react';

import {
  AssessmentFieldsFragment,
  AssessmentRole,
  GetEnrollmentAssessmentsQuery,
  GetEnrollmentAssessmentsQueryVariables,
  useGetEnrollmentAssessmentsQuery,
} from '@/types/gqlTypes';

/**
 * Get the most recent intake assessment for the given enrollment
 */
export function useIntakeAssessment(enrollmentId: string) {
  const { data, ...status } = useGetEnrollmentAssessmentsQuery({
    variables: { id: enrollmentId, role: AssessmentRole.Intake },
    // FIXME: could update cache directly on save & remove this?
    fetchPolicy: 'cache-and-network',
  });
  console.log(data);

  if (status.error) console.error(status.error, data);

  const assessment = useMemo(
    () => data?.enrollment?.assessments?.nodes[0],
    [data]
  );
  return [assessment, status] as [
    assessment: AssessmentFieldsFragment | undefined,
    status: Omit<
      QueryResult<
        GetEnrollmentAssessmentsQuery,
        GetEnrollmentAssessmentsQueryVariables
      >,
      'data'
    >
  ];
}
