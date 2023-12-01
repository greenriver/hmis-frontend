import apolloClient from '@/providers/apolloClient';
import {
  ClientNameFragment,
  ClientNameFragmentDoc,
  useGetClientNameQuery,
} from '@/types/gqlTypes';

export function useClientName(clientId?: string) {
  // get client from cache if we have it
  const client = clientId
    ? apolloClient.readFragment({
        id: `Client:${clientId}`,
        fragment: ClientNameFragmentDoc,
        fragmentName: 'ClientName',
      })
    : undefined;

  // otherwise query for it
  const { loading, error } = useGetClientNameQuery({
    variables: { id: clientId as string },
    // skip if we already have the fragment, OR if we have no enrollment id
    skip: !!client || !clientId,
  });
  if (error) throw error;

  return { client, loading } as {
    client: ClientNameFragment | undefined;
    loading: boolean;
  };
}
