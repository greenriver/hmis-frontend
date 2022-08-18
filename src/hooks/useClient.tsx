import { useQuery } from '@apollo/client';

import { GET_CLIENT } from '@/api/client.gql';
import { Client } from '@/types/gqlTypes';

const useClient = (id: string) => {
  const { data, loading, error } = useQuery<{ client: Client }>(GET_CLIENT, {
    variables: { id: id.toString() },
  });
  if (error) throw error;
  const client: Client | undefined = data?.client;

  return [client, loading] as const;
};

export default useClient;
