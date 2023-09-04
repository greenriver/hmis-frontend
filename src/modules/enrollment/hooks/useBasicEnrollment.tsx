import {
  EnrollmentFieldsFragment,
  useGetEnrollmentQuery,
} from '@/types/gqlTypes';

export function useBasicEnrollment(enrollmentId?: string) {
  const { data, loading, error } = useGetEnrollmentQuery({
    variables: { id: enrollmentId as string },
    skip: !enrollmentId,
  });

  if (error) throw error;

  const enrollment: EnrollmentFieldsFragment | undefined =
    data?.enrollment || undefined;

  return {
    enrollment,
    loading: loading && !enrollment,
  };
}
