import { useMemo } from 'react';

import {
  ClientFieldsFragment,
  useGetClientHouseholdMemberCandidatesQuery,
} from '@/types/gqlTypes';

/**
 * Get a unique list of recent household members for this client
 */
export function useRecentHouseholdMembers(clientId: string) {
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
    client.enrollments.nodes.forEach((en) => {
      en.household.householdClients.forEach(({ client }) => {
        if (client.id in members) return;
        if (client.id === clientId) return;
        members[client.id] = client;
      });
    });
    return Object.values(members);
  }, [client, clientId]);

  if (error) throw error;

  return [members, loading] as [
    members: ClientFieldsFragment[] | undefined,
    loading: boolean
  ];
}
