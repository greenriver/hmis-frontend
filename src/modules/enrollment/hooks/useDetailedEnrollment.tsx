import {
  AllEnrollmentDetailsFragment,
  useGetEnrollmentDetailsQuery,
} from '@/types/gqlTypes';

export function useDetailedEnrollment(enrollmentId?: string) {
  const { data, loading, error } = useGetEnrollmentDetailsQuery({
    variables: { id: enrollmentId as string },
    skip: !enrollmentId,
  });

  if (error) throw error;

  const enrollment: AllEnrollmentDetailsFragment | undefined =
    data?.enrollment || undefined;

  return {
    enrollment,
    loading: loading && !enrollment,
  };
}
