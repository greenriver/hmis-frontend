import { useMemo } from 'react';

import { sortHouseholdMembers } from '@/modules/hmis/hmisUtil';
import { useGetEnrollmentWithHoHQuery } from '@/types/gqlTypes';

export function useHouseholdMembers(enrollmentId: string) {
  const { data: { enrollment: enrollment } = {}, ...status } =
    useGetEnrollmentWithHoHQuery({
      variables: { id: enrollmentId },
    });

  const householdMembers = useMemo(
    () => sortHouseholdMembers(enrollment?.household.householdClients),
    [enrollment]
  );

  return [householdMembers, status] as const;
}
