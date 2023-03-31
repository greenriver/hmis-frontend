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
  value: ClientFieldsFragment | RecentHouseholdMember
): value is RecentHouseholdMember {
  return (
    !isNil(value) &&
    typeof value === 'object' &&
    !!value.hasOwnProperty('client')
  );
}

export function getClientIdentification(
  value: ClientFieldsFragment | RecentHouseholdMember
): ClientIdentificationFieldsFragment {
  if (isHouseholdClient(value)) return value.client;
  return value;
}
