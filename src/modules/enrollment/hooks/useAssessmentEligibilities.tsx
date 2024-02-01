import { useGetEnrollmentAssessmentEligibilitiesQuery } from '@/types/gqlTypes';

export function useAssessmentEligibilities(enrollmentId: string) {
  const { data, error, loading } = useGetEnrollmentAssessmentEligibilitiesQuery(
    {
      fetchPolicy: 'cache-and-network',
      variables: { enrollmentId },
    }
  );
  if (error) throw error;

  return {
    assessmentEligibilities: data?.enrollment?.assessmentEligibilities,
    loading,
  };
}
