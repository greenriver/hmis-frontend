import { isNil } from 'lodash-es';

import {
  ClientFieldsFragment,
  ClientIdentificationFieldsFragment,
  ClientSearchResultFieldsFragment,
  EnrollmentFieldsFragment,
  GetClientHouseholdMemberCandidatesQuery,
  HouseholdClientFieldsFragment,
  ProjectEnrollmentFieldsFragment,
  ProjectEnrollmentsHouseholdClientFieldsFragment,
} from '@/types/gqlTypes';

export type RecentHouseholdMember = NonNullable<
  GetClientHouseholdMemberCandidatesQuery['client']
>['enrollments']['nodes'][0]['household']['householdClients'][0] & {
  projectName: string;
};

export function isHouseholdClient(
  value:
    | ClientFieldsFragment
    | ClientSearchResultFieldsFragment
    | HouseholdClientFieldsFragment
    | EnrollmentFieldsFragment
    | ProjectEnrollmentFieldsFragment
    | ProjectEnrollmentsHouseholdClientFieldsFragment
): value is
  | HouseholdClientFieldsFragment
  | ProjectEnrollmentsHouseholdClientFieldsFragment {
  return (
    !isNil(value) &&
    typeof value === 'object' &&
    value.__typename === 'HouseholdClient' &&
    !!value.hasOwnProperty('client')
  );
}

export function isEnrollment(
  value:
    | ClientFieldsFragment
    | ClientSearchResultFieldsFragment
    | HouseholdClientFieldsFragment
    | EnrollmentFieldsFragment
    | ProjectEnrollmentFieldsFragment
): value is EnrollmentFieldsFragment | ProjectEnrollmentFieldsFragment {
  return (
    !isNil(value) &&
    typeof value === 'object' &&
    value.__typename === 'Enrollment' &&
    !!value.hasOwnProperty('client')
  );
}

export function isRecentHouseholdMember(
  value: ClientSearchResultFieldsFragment | RecentHouseholdMember
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
