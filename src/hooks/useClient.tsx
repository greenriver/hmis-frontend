import { useQuery } from '@apollo/client';

import { GET_CLIENTS } from '@/api/clients.gql';
import { ClientsPaginated } from '@/types/gqlTypes';

const useClient = (id: string) => {
  const {
    data: { clientSearch: data } = {},
    loading,
    error,
  } = useQuery<{ clientSearch: ClientsPaginated }>(GET_CLIENTS, {
    variables: {
      input: { id },
      limit: 1,
      offset: 0,
    },
  });
  if (error) throw error;
  if (!loading && data && data.nodesCount !== 1)
    throw new Error('Unexpected node count for client lookup');

  return [data?.nodes[0], loading] as const;
};

export default useClient;
