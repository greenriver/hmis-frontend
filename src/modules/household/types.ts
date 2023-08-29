import { isNil } from 'lodash-es';

import {
  ClientFieldsFragment,
  ClientIdentificationFieldsFragment,
  HouseholdClientFieldsFragment,
} from '@/types/gqlTypes';

export type RecentHouseholdMember = HouseholdClientFieldsFragment & {
  projectName: string;
};

export function isHouseholdClient(
  value: ClientFieldsFragment | HouseholdClientFieldsFragment
): value is HouseholdClientFieldsFragment {
  return (
    !isNil(value) &&
    typeof value === 'object' &&
    value.__typename === 'HouseholdClient' &&
    !!value.hasOwnProperty('client')
  );
}

export function isRecentHouseholdMember(
  value: ClientFieldsFragment | RecentHouseholdMember
): value is RecentHouseholdMember {
  return (
    !isNil(value) &&
    typeof value === 'object' &&
    value.__typename === 'HouseholdClient' &&
    !!value.hasOwnProperty('projectName')
  );
}

export function getClientIdentification(
  value: ClientFieldsFragment | RecentHouseholdMember
): ClientIdentificationFieldsFragment {
  if (isHouseholdClient(value)) return value.client;
  return value;
}
