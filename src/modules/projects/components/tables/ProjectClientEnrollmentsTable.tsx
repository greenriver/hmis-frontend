import { Box } from '@mui/material';
import React, { useMemo } from 'react';
import DateWithRelativeTooltip from '@/components/elements/DateWithRelativeTooltip';
import {
  getViewClientMenuItem,
  getViewEnrollmentMenuItem,
} from '@/components/elements/table/tableRowActionUtil';
import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { DataColumnDef } from '@/modules/dataFetching/types';
import { ClientEnrollmentTableFields } from '@/modules/enrollment/components/pages/ClientEnrollmentsPage';
import EnrollmentStatus from '@/modules/hmis/components/EnrollmentStatus';
import { useFilters } from '@/modules/hmis/filterUtil';
import {
  clientBriefName,
  formatDateForDisplay,
  formatDateForGql,
  PERMANENT_HOUSING_PROJECT_TYPES,
} from '@/modules/hmis/hmisUtil';
import HouseholdStaff from '@/modules/projects/components/HouseholdStaff';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { CLIENT_COLUMNS } from '@/modules/search/components/ClientSearch';
import { HmisEnums } from '@/types/gqlEnums';
import {
  ClientEnrollmentFieldsFragment,
  EnrollmentFieldsFragment,
  EnrollmentsForProjectFilterOptions,
  EnrollmentSortOption,
  EnrollmentWithOptionalFieldsFragment,
  GetProjectEnrollmentsDocument,
  GetProjectEnrollmentsQuery,
  GetProjectEnrollmentsQueryVariables,
  HouseholdWithStaffAssignmentsFragment,
  InputMaybe,
  ProjectEnrollmentQueryEnrollmentFieldsFragment,
  Scalars,
} from '@/types/gqlTypes';

export type ProjectEnrollmentFields = NonNullable<
  GetProjectEnrollmentsQuery['project']
>['enrollments']['nodes'][number];

const hasHouseholdWithStaff = (
  enrollment: any
): enrollment is { household: HouseholdWithStaffAssignmentsFragment } => {
  return (
    'household' in enrollment && 'staffAssignments' in enrollment.household
  );
};

type EnrollmentQueryVariables = Partial<{
  includeStaffAssignment?: InputMaybe<Scalars['Boolean']['input']>;
  includeMoveInDate?: InputMaybe<Scalars['Boolean']['input']>;
  includeLastContact?: InputMaybe<Scalars['Boolean']['input']>;
}>;

export const HOUSEHOLD_ASSIGNED_STAFF_COL: DataColumnDef<
  HouseholdWithStaffAssignmentsFragment,
  EnrollmentQueryVariables
> = {
  header: 'Assigned Staff',
  optional: {
    defaultHidden: true,
    queryVariableField: 'includeStaffAssignment',
  },
  key: 'assigned_staff',
  render: (hh) => <HouseholdStaff household={hh} />,
};

export const ENROLLMENT_COLUMNS: {
  [key: string]: DataColumnDef<
    | ClientEnrollmentTableFields
    | ProjectEnrollmentQueryEnrollmentFieldsFragment
    | ClientEnrollmentFieldsFragment,
    EnrollmentQueryVariables
  >;
} = {
  entryDate: {
    header: 'Entry Date',
    key: 'entryDate',
    render: ({ entryDate }) => (
      <DateWithRelativeTooltip dateString={entryDate} preciseTime={false} />
    ),
  },
  exitDate: {
    header: 'Exit Date',
    key: 'exitDate',
    optional: {
      defaultHidden: true,
      // queryVariableField not provided here, since we need to fetch exitDate anyway in order to show the status
      // and correctly aria-label the row action
    },
    render: ({ exitDate }) =>
      exitDate && (
        <DateWithRelativeTooltip dateString={exitDate} preciseTime={false} />
      ),
  },
  enrollmentStatus: {
    header: 'Status',
    key: 'status',
    render: (e) => <EnrollmentStatus enrollment={e} />,
  },
  moveInDate: {
    header: 'Move-in Date',
    key: 'moveInDate',
    optional: {
      defaultHidden: true,
      queryVariableField: 'includeMoveInDate',
    },
    render: ({ moveInDate }) =>
      moveInDate && (
        <DateWithRelativeTooltip dateString={moveInDate} preciseTime={false} />
      ),
  },
  lastContactDate: {
    header: 'Last Contact Date',
    key: 'lastContactDate',
    optional: {
      defaultHidden: true,
      queryVariableField: 'includeLastContact',
    },
    render: (e) => {
      if ('lastContact' in e && e.lastContact) {
        return (
          <Box whiteSpace='nowrap'>
            <DateWithRelativeTooltip
              dateString={e.lastContact.contactDate}
              preciseTime={false}
            />{' '}
            ({HmisEnums.LastContactType[e.lastContact.contactType]})
          </Box>
        );
      }
    },
  },
  assignedStaff: {
    ...HOUSEHOLD_ASSIGNED_STAFF_COL,
    tableCellProps: undefined,
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
  [key: string]: DataColumnDef<
    WithEnrollment,
    { includeOrganizationName?: InputMaybe<Scalars['Boolean']['input']> }
  >;
} = {
  entryDate: {
    header: ENROLLMENT_COLUMNS.entryDate.header,
    key: 'entryDate',
    render: ({ enrollment }) => (
      <DateWithRelativeTooltip
        dateString={enrollment.entryDate}
        preciseTime={false}
      />
    ),
  },
  exitDate: {
    header: ENROLLMENT_COLUMNS.exitDate.header,
    key: 'exitDate',
    optional: {
      defaultHidden: true,
      // queryVariableField not provided here, since we need to fetch exitDate anyway in order to show the status
      // and correctly aria-label the row action
    },
    render: ({ enrollment }) => {
      if (enrollment.exitDate)
        return (
          <DateWithRelativeTooltip
            dateString={enrollment.exitDate}
            preciseTime={false}
          />
        );
    },
  },
  enrollmentStatus: {
    header: ENROLLMENT_COLUMNS.enrollmentStatus.header,
    key: 'status',
    render: ({ enrollment }) => <EnrollmentStatus enrollment={enrollment} />,
  },
  organizationName: {
    header: 'Organization Name',
    key: 'organizationName',
    optional: {
      defaultHidden: true,
      queryVariableField: 'includeOrganizationName',
    },
    render: ({ enrollment }) => {
      return enrollment.organizationName;
    },
  },
};

export const WITH_ENROLLMENT_OPTIONAL_COLUMNS: {
  [key: string]: DataColumnDef<WithEnrollment, EnrollmentQueryVariables>;
} = {
  moveInDate: {
    header: ENROLLMENT_COLUMNS.moveInDate.header,
    key: 'moveInDate',
    optional: {
      defaultHidden: true,
      queryVariableField: 'includeMoveInDate',
    },
    render: ({ enrollment }) =>
      enrollment.moveInDate && (
        <DateWithRelativeTooltip
          dateString={enrollment.moveInDate}
          preciseTime={false}
        />
      ),
  },
  lastContactDate: {
    header: ENROLLMENT_COLUMNS.lastContactDate.header,
    key: 'lastContactDate',
    optional: {
      defaultHidden: true,
      queryVariableField: 'includeLastContact',
    },
    render: ({ enrollment }) => {
      if (enrollment.lastContact) {
        return (
          <Box flexDirection='row'>
            <DateWithRelativeTooltip
              dateString={enrollment.lastContact.contactDate}
              preciseTime={false}
            />{' '}
            ({HmisEnums.LastContactType[enrollment.lastContact.contactType]})
          </Box>
        );
      }
    },
  },
};

const ProjectClientEnrollmentsTable = ({
  projectId,
  openOnDate,
  searchTerm,
}: {
  projectId: string;
  openOnDate?: Date;
  searchTerm?: string;
}) => {
  // TODO: show MCI column if enabled
  // const { globalFeatureFlags } = useHmisAppSettings();
  // globalFeatureFlags?.mciId
  const openOnDateString = useMemo(
    () => (openOnDate ? formatDateForGql(openOnDate) : undefined),
    [openOnDate]
  );

  const {
    project: { staffAssignmentsEnabled, projectType },
  } = useProjectDashboardContext();

  const columns: ColumnDef<ProjectEnrollmentQueryEnrollmentFieldsFragment>[] =
    useMemo(() => {
      return [
        { ...CLIENT_COLUMNS.name, sticky: 'left' },
        CLIENT_COLUMNS.age,
        ENROLLMENT_COLUMNS.entryDate,
        ENROLLMENT_COLUMNS.exitDate,
        ENROLLMENT_COLUMNS.enrollmentStatus,
        ...(projectType && PERMANENT_HOUSING_PROJECT_TYPES.includes(projectType)
          ? [ENROLLMENT_COLUMNS.moveInDate]
          : []),
        ENROLLMENT_COLUMNS.lastContactDate,
        ...(staffAssignmentsEnabled ? [ENROLLMENT_COLUMNS.assignedStaff] : []),
      ];
    }, [projectType, staffAssignmentsEnabled]);

  const filters = useFilters({
    type: 'EnrollmentsForProjectFilterOptions',
    omit: [
      'searchTerm',
      'bedNightOnDate',
      staffAssignmentsEnabled ? '' : 'assignedStaff',
    ],
    pickListArgs: { projectId: projectId },
  });

  return (
    <GenericTableWithData<
      GetProjectEnrollmentsQuery,
      GetProjectEnrollmentsQueryVariables,
      ProjectEnrollmentFields,
      EnrollmentsForProjectFilterOptions
    >
      queryVariables={{
        id: projectId,
        filters: {
          searchTerm,
          openOnDate: openOnDateString,
        },
      }}
      queryDocument={GetProjectEnrollmentsDocument}
      columns={columns}
      rowLinkTo={(row) => getViewEnrollmentMenuItem(row, row.client).to}
      rowActionTitle='View Enrollment'
      rowName={(row) => clientBriefName(row.client)}
      rowSecondaryActionConfigs={(row) => [getViewClientMenuItem(row.client)]}
      noData={
        openOnDate
          ? `No enrollments open on ${formatDateForDisplay(openOnDate)}`
          : 'No enrollments'
      }
      pagePath='project.enrollments'
      recordType='Enrollment'
      filters={filters}
      defaultSortOption={EnrollmentSortOption.MostRecent}
    />
  );
};

export default ProjectClientEnrollmentsTable;
