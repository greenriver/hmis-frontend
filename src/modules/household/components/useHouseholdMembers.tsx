import { useMemo } from 'react';

import { sortHouseholdMembers } from '@/modules/hmis/hmisUtil';
import {
  HouseholdClientFieldsWithAssessmentsFragment,
  useGetEnrollmentWithHouseholdQuery,
} from '@/types/gqlTypes';

export function useHouseholdMembers(enrollmentId: string) {
  const { data: { enrollment: enrollment } = {}, ...status } =
    useGetEnrollmentWithHouseholdQuery({
      variables: { id: enrollmentId },
    });

  const householdMembers: HouseholdClientFieldsWithAssessmentsFragment[] =
    useMemo(
      () => sortHouseholdMembers(enrollment?.household.householdClients),
      [enrollment]
    );

  return [householdMembers, status] as const;
}
