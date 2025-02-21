import { compareDesc } from 'date-fns';
import { useMemo } from 'react';

import {
  clientBriefName,
  findHohOrRep,
  parseHmisDateString,
} from '@/modules/hmis/hmisUtil';
import { RecentHouseholdMember } from '@/modules/household/types';
import {
  HouseholdFieldsFragment,
  useGetClientHouseholdMemberCandidatesQuery,
} from '@/types/gqlTypes';

/**
 * Get a unique list of recent household members for this household.
 * Currently based off HoH only. Could be expanded to look at previously
 * associated members to all clients in the household, but we should
 * make a dedicated more performant query before doing so.
 */
export function usePreviouslyAssociatedMembers(
  household?: HouseholdFieldsFragment | null
) {
  const hohClient = useMemo(
    () =>
      household ? findHohOrRep(household?.householdClients)?.client : undefined,
    [household]
  );

  const { data, loading, error } = useGetClientHouseholdMemberCandidatesQuery({
    variables: { id: hohClient?.id || '' },
    skip: !hohClient,
  });

  const members = useMemo(() => {
    if (!data?.client) return;
    const members: Record<string, RecentHouseholdMember> = {};

    const currentHouseholdClientIds = new Set(
      household?.householdClients.map((c) => c.client.id)
    );

    data.client.enrollments.nodes.forEach((en) => {
      en.household.householdClients.forEach((hc) => {
        if (
          !members[hc.client.id] && // not seen yet
          !currentHouseholdClientIds.has(hc.client.id) // not in the current household
        ) {
          members[hc.client.id] = {
            ...hc,
            projectName: en.project.projectName,
          };
        }
      });
    });
    // sort by most recently associated
    return Object.values(members).sort((a, b) => {
      const entry1 = parseHmisDateString(a.enrollment.entryDate);
      const entry2 = parseHmisDateString(b.enrollment.entryDate);
      if (!entry1 || !entry2) return -1; // not expected, would be date parse issue
      return compareDesc(entry1, entry2);
    });
  }, [data, household?.householdClients]);

  if (error) throw error;

  return {
    previouslyAssociatedMembers: members,
    loading,
    previouslyAssociatedMembersDescription: hohClient
      ? `These clients have been previously enrolled at a project with ${clientBriefName(hohClient)}. Only household associations in projects you have permission to see are shown.`
      : undefined,
  };
}
