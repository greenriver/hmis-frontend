import { useMemo } from 'react';

import useSafeParams from '@/hooks/useSafeParams';
import { sortHouseholdMembers } from '@/modules/hmis/hmisUtil';
import {
  HouseholdClientFieldsWithAssessmentsFragment,
  useGetEnrollmentWithHouseholdQuery,
} from '@/types/gqlTypes';

export function useHouseholdMembers(
  enrollmentId: string,
  limit?: 'INCOMPLETE_ENTRY' | 'INCOMPLETE_EXIT'
) {
  const { clientId } = useSafeParams();

  const { data: { enrollment: enrollment } = {}, ...status } =
    useGetEnrollmentWithHouseholdQuery({
      variables: { id: enrollmentId },
      fetchPolicy: 'cache-and-network',
    });

  const householdMembers: HouseholdClientFieldsWithAssessmentsFragment[] =
    useMemo(() => {
      if (!enrollment) return [];
      let members = enrollment.household.householdClients;

      if (limit === 'INCOMPLETE_EXIT') {
        members = members.filter(
          (c) => !c.enrollment.exitDate && !c.enrollment.inProgress
        );
      }
      if (limit === 'INCOMPLETE_ENTRY') {
        members = members.filter((c) => c.enrollment.inProgress);
      }

      return sortHouseholdMembers(members, clientId);
    }, [enrollment, limit, clientId]);

  if (status.error) throw status.error;

  return [householdMembers, status] as const;
}
