import apolloClient from '@/providers/apolloClient';
import { UserFieldsFragmentDoc, useGetUserQuery } from '@/types/gqlTypes';

export function useUser(userId?: string) {
  // get user from cache if we have it
  const user = userId
    ? apolloClient.readFragment({
        id: `ApplicationUser:${userId}`,
        fragment: UserFieldsFragmentDoc,
        fragmentName: 'UserFields',
      })
    : undefined;

  // otherwise query for it
  const { loading, error } = useGetUserQuery({
    variables: { id: userId as string },
    // skip if we already have the fragment, OR if we have no enrollment id
    skip: !!user || !userId,
  });
  if (error) throw error;

  return { user, loading } as const;
}
