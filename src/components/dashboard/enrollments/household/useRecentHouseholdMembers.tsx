import { useMemo } from 'react';

import {
  ClientFieldsFragment,
  useGetClientHouseholdMemberCandidatesQuery,
} from '@/types/gqlTypes';

/**
 * Get a unique list of recent household members for this client
 */
export function useRecentHouseholdMembers(
  clientId: string,
  includeSourceClient?: boolean
) {
  const {
    data: { client: client } = {},
    loading,
    error,
  } = useGetClientHouseholdMemberCandidatesQuery({
    variables: { id: clientId },
  });

  const members = useMemo(() => {
    if (!client) return;
    const members: Record<string, ClientFieldsFragment> = {};
    let sourceClient;
    client.enrollments.nodes.forEach((en) => {
      en.household.householdClients.forEach(({ client }) => {
        if (client.id in members) return;
        if (client.id === clientId) {
          sourceClient = client;
        } else {
          members[client.id] = client;
        }
      });
    });
    const clients = Object.values(members);
    if (includeSourceClient && sourceClient) clients.unshift(sourceClient);
    return clients;
  }, [client, clientId, includeSourceClient]);

  if (error) throw error;

  return [members, loading] as [
    members: ClientFieldsFragment[] | undefined,
    loading: boolean
  ];
}
