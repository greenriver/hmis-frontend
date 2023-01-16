import apolloClient from '@/providers/apolloClient';
import {
  EnrollmentFieldsFragment,
  EnrollmentFieldsFragmentDoc,
  useGetEnrollmentQuery,
} from '@/types/gqlTypes';

export function useEnrollment(enrollmentId?: string) {
  // get enrollment from cache if we have it
  const enrollment = enrollmentId
    ? apolloClient.readFragment({
        id: `Enrollment:${enrollmentId}`,
        fragment: EnrollmentFieldsFragmentDoc,
        fragmentName: 'EnrollmentFields',
      })
    : undefined;

  // otherwise query for it
  const { loading, error } = useGetEnrollmentQuery({
    variables: { id: enrollmentId as string },
    // skip if we already have the fragment, OR if we have no enrollment id
    skip: !!enrollment || !enrollmentId,
  });
  if (error) throw error;

  return { enrollment, loading } as {
    loading: boolean;
    enrollment: EnrollmentFieldsFragment | undefined;
  };
}
