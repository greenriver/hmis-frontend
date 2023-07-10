import { useMemo } from 'react';

import useSafeParams from '@/hooks/useSafeParams';
import { sortHouseholdMembers } from '@/modules/hmis/hmisUtil';
import {
  HouseholdClientFieldsFragment,
  useGetEnrollmentWithHouseholdQuery,
} from '@/types/gqlTypes';

export function useHouseholdMembers(enrollmentId: string) {
  const { clientId } = useSafeParams();

  const { data: { enrollment: enrollment } = {}, ...status } =
    useGetEnrollmentWithHouseholdQuery({
      variables: { id: enrollmentId },
      fetchPolicy: 'cache-and-network',
    });

  const householdMembers: HouseholdClientFieldsFragment[] | undefined =
    useMemo(() => {
      if (!enrollment) return;
      return sortHouseholdMembers(
        enrollment.household.householdClients,
        clientId
      );
    }, [enrollment, clientId]);

  if (status.error) throw status.error;

  return [householdMembers, status] as const;
}
