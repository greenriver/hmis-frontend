import React from 'react';
import LastContact from './LastContact';
import DateWithRelativeTooltip from '@/components/elements/DateWithRelativeTooltip';
import { DataColumnDef } from '@/modules/dataFetching/types';
import HouseholdStaff, {
  hasHouseholdWithStaff,
} from '@/modules/enrollment/columns/HouseholdStaff';
import { ClientEnrollmentTableFields } from '@/modules/enrollment/components/pages/ClientEnrollmentsPage';
import EnrollmentStatus, {
  EnrollmentWithStatus,
} from '@/modules/hmis/components/EnrollmentStatus';
import {
  ClientEnrollmentFieldsFragment,
  EnrollmentFieldsFragment,
  EnrollmentWithOptionalFieldsFragment,
  HouseholdWithStaffAssignmentsFragment,
  InputMaybe,
  ProjectEnrollmentQueryEnrollmentFieldsFragment,
  Scalars,
} from '@/types/gqlTypes';

type EnrollmentQueryVariables = Partial<{
  includeStaffAssignment?: InputMaybe<Scalars['Boolean']['input']>;
  includeMoveInDate?: InputMaybe<Scalars['Boolean']['input']>;
  includeLastContact?: InputMaybe<Scalars['Boolean']['input']>;
}>;

type WithEnrollmentQueryVariables = Partial<{
  includeOrganizationName?: InputMaybe<Scalars['Boolean']['input']>;
}>;

export const ENTRY_DATE_COL = {
  header: 'Entry Date',
  key: 'entryDate',
  render: ({ entryDate }: Pick<EnrollmentFieldsFragment, 'entryDate'>) => (
    <DateWithRelativeTooltip dateString={entryDate} preciseTime={false} />
  ),
};

const EXIT_DATE_COL = {
  header: 'Exit Date',
  key: 'exitDate',
  optional: {
    defaultHidden: true,
    // queryVariableField not provided here, since we need to fetch exitDate anyway in order to show the status
    // and correctly aria-label the row action
  },
  render: ({ exitDate }: Pick<EnrollmentFieldsFragment, 'exitDate'>) =>
    exitDate && (
      <DateWithRelativeTooltip dateString={exitDate} preciseTime={false} />
    ),
};

export const ENROLLMENT_STATUS_COL = {
  header: 'Status',
  key: 'status',
  render: (e: EnrollmentWithStatus) => <EnrollmentStatus enrollment={e} />,
};

export const MOVE_IN_DATE_COL = {
  header: 'Move-in Date',
  key: 'moveInDate',
  optional: {
    defaultHidden: true,
    queryVariableField: 'includeMoveInDate' as keyof EnrollmentQueryVariables,
  },
  render: ({
    moveInDate,
  }: Pick<EnrollmentWithOptionalFieldsFragment, 'moveInDate'>) =>
    moveInDate && (
      <DateWithRelativeTooltip dateString={moveInDate} preciseTime={false} />
    ),
};

export const LAST_CONTACT_DATE_COL = {
  header: 'Last Contact Date',
  key: 'lastContactDate',
  optional: {
    defaultHidden: true,
    queryVariableField: 'includeLastContact' as keyof EnrollmentQueryVariables,
  },
  render: (e: Pick<EnrollmentWithOptionalFieldsFragment, 'lastContact'>) => {
    if ('lastContact' in e && e.lastContact) {
      return <LastContact enrollment={e} />;
    }
  },
};

export const HOUSEHOLD_ASSIGNED_STAFF_COL = {
  header: 'Assigned Staff',
  optional: {
    defaultHidden: true,
    queryVariableField:
      'includeStaffAssignment' as keyof EnrollmentQueryVariables,
  },
  key: 'assigned_staff',
  render: (hh: HouseholdWithStaffAssignmentsFragment) => (
    <HouseholdStaff household={hh} />
  ),
};

export const ORGANIZATION_NAME_COL = {
  header: 'Organization Name',
  key: 'organizationName',
  optional: {
    defaultHidden: true,
    queryVariableField:
      'includeOrganizationName' as keyof WithEnrollmentQueryVariables,
  },
  render: ({ enrollment }: WithEnrollment) => {
    return enrollment.organizationName;
  },
};

export const ENROLLMENT_COLUMNS: {
  [key: string]: DataColumnDef<
    | ClientEnrollmentTableFields
    | ProjectEnrollmentQueryEnrollmentFieldsFragment,
    EnrollmentQueryVariables
  >;
} = {
  entryDate: ENTRY_DATE_COL,
  exitDate: EXIT_DATE_COL,
  enrollmentStatus: ENROLLMENT_STATUS_COL,
  moveInDate: MOVE_IN_DATE_COL,
  lastContactDate: LAST_CONTACT_DATE_COL,
  assignedStaff: {
    ...HOUSEHOLD_ASSIGNED_STAFF_COL,
    render: (enrollment) => {
      return hasHouseholdWithStaff(enrollment) ? (
        <HouseholdStaff household={enrollment.household} />
      ) : null;
    },
  },
};

type WithEnrollment = {
  enrollment: Pick<
    EnrollmentFieldsFragment,
    'entryDate' | 'exitDate' | 'inProgress'
  > &
    Partial<
      Pick<ClientEnrollmentFieldsFragment, 'autoExited' | 'organizationName'>
    > &
    Partial<
      Pick<EnrollmentWithOptionalFieldsFragment, 'moveInDate' | 'lastContact'>
    >;
};

export const WITH_ENROLLMENT_COLUMNS: {
  [key: string]: DataColumnDef<WithEnrollment, WithEnrollmentQueryVariables>;
} = {
  entryDate: {
    ...ENTRY_DATE_COL,
    render: ({ enrollment }) => ENTRY_DATE_COL.render(enrollment),
  },
  exitDate: {
    ...EXIT_DATE_COL,
    render: ({ enrollment }) => EXIT_DATE_COL.render(enrollment),
  },
  enrollmentStatus: {
    ...ENROLLMENT_STATUS_COL,
    render: ({ enrollment }) => ENROLLMENT_STATUS_COL.render(enrollment),
  },
  organizationName: ORGANIZATION_NAME_COL,
};

export const WITH_ENROLLMENT_OPTIONAL_COLUMNS: {
  [key: string]: DataColumnDef<WithEnrollment, EnrollmentQueryVariables>;
} = {
  moveInDate: {
    ...MOVE_IN_DATE_COL,
    render: ({ enrollment }) => MOVE_IN_DATE_COL.render(enrollment),
  },
  lastContactDate: {
    ...LAST_CONTACT_DATE_COL,
    render: ({ enrollment }) => LAST_CONTACT_DATE_COL.render(enrollment),
  },
};
