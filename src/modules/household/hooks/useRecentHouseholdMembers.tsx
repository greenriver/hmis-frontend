import { useMemo } from 'react';

import { RecentHouseholdMember } from '../types';

import { useGetClientHouseholdMemberCandidatesQuery } from '@/types/gqlTypes';

/**
 * Get a unique list of recent household members for this client
 */
export function useRecentHouseholdMembers(
  clientId?: string,
  includeSourceClient?: boolean
) {
  const {
    data: { client: client } = {},
    loading,
    error,
  } = useGetClientHouseholdMemberCandidatesQuery({
    variables: { id: clientId || '' },
    skip: !clientId,
  });

  const members = useMemo(() => {
    if (!client) return;
    const members: Record<string, RecentHouseholdMember> = {};
    let sourceClient;
    client.enrollments.nodes.forEach((en) => {
      en.household.householdClients.forEach((hc) => {
        if (hc.client.id === clientId) {
          sourceClient = { ...hc, projectName: en.project.projectName };
        } else if (!members[hc.client.id]) {
          members[hc.client.id] = {
            ...hc,
            projectName: en.project.projectName,
          };
        }
      });
    });
    const clients = Object.values(members);
    if (includeSourceClient && sourceClient) clients.unshift(sourceClient);
    return clients;
  }, [client, clientId, includeSourceClient]);

  if (error) throw error;

  return [members, loading] as [
    members: RecentHouseholdMember[] | undefined,
    loading: boolean
  ];
}
