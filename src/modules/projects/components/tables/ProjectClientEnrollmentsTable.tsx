import { Box, Chip, Tooltip } from '@mui/material';
import React, { ReactNode, useMemo } from 'react';
import DateWithRelativeTooltip from '@/components/elements/DateWithRelativeTooltip';
import {
  getViewClientMenuItem,
  getViewEnrollmentMenuItem,
} from '@/components/elements/table/tableRowActionUtil';
import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { GenericTableWithDataColumnDef } from '@/modules/dataFetching/types';
import { ClientEnrollmentTableFields } from '@/modules/enrollment/components/pages/ClientEnrollmentsPage';
import EnrollmentStatus from '@/modules/hmis/components/EnrollmentStatus';
import { useFilters } from '@/modules/hmis/filterUtil';
import {
  clientBriefName,
  formatDateForDisplay,
  formatDateForGql,
  PERMANENT_HOUSING_PROJECT_TYPES,
} from '@/modules/hmis/hmisUtil';
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

const isHouseholdWithStaff = (
  e: any
): e is { household: HouseholdWithStaffAssignmentsFragment } => {
  return 'household' in e && 'staffAssignments' in e.household;
};

type EnrollmentQueryVariables = Partial<{
  includeStaffAssignment?: InputMaybe<Scalars['Boolean']['input']>;
  includeMoveInDate?: InputMaybe<Scalars['Boolean']['input']>;
  includeLastContact?: InputMaybe<Scalars['Boolean']['input']>;
}>;

const renderHouseholdAssignedStaff = (
  hh: HouseholdWithStaffAssignmentsFragment
): ReactNode => {
  if (!hh.staffAssignments?.nodes.length) return;

  const allNames = hh.staffAssignments.nodes.map(
    (staffAssignment) => staffAssignment.user.name
  );

  const first = allNames[0];
  const rest = allNames.slice(1);

  return (
    <Box aria-label={allNames.join(', ')}>
      {first}{' '}
      {rest.length > 0 && (
        <Tooltip arrow title={rest.join(', ')}>
          <Chip sx={{ mb: 0.5 }} size='small' label={`+${rest.length} more`} />
        </Tooltip>
      )}
    </Box>
  );
};

export const HOUSEHOLD_ASSIGNED_STAFF_COL: GenericTableWithDataColumnDef<
  HouseholdWithStaffAssignmentsFragment,
  EnrollmentQueryVariables
> = {
  header: 'Assigned Staff',
  optional: {
    defaultHidden: true,
    queryVariableField: 'includeStaffAssignment',
  },
  key: 'assigned_staff',
  render: renderHouseholdAssignedStaff,
};

export const ENROLLMENT_COLUMNS: {
  [key: string]: GenericTableWithDataColumnDef<
    | ClientEnrollmentTableFields
    | ProjectEnrollmentQueryEnrollmentFieldsFragment
    | ClientEnrollmentFieldsFragment,
    EnrollmentQueryVariables
  >;
} = {
  entryDate: {
    header: 'Entry Date',
    key: 'entryDate',
    render: (e) => (
      <DateWithRelativeTooltip dateString={e.entryDate} preciseTime={false} />
    ),
  },
  exitDate: {
    header: 'Exit Date',
    key: 'exitDate',
    optional: {
      defaultHidden: true,
    },
    render: (e) => {
      if (e.exitDate) {
        return (
          <DateWithRelativeTooltip
            dateString={e.exitDate}
            preciseTime={false}
          />
        );
      }
    },
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
    render: (e) => {
      if (e.moveInDate) {
        return (
          <DateWithRelativeTooltip
            dateString={e.moveInDate}
            preciseTime={false}
          />
        );
      }
    },
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
          <Box flexDirection='row'>
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
    render: (e) => {
      return isHouseholdWithStaff(e)
        ? renderHouseholdAssignedStaff(e.household)
        : null;
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
  [key: string]: GenericTableWithDataColumnDef<
    WithEnrollment,
    { includeOrganizationName?: InputMaybe<Scalars['Boolean']['input']> }
  >;
} = {
  entryDate: {
    header: ENROLLMENT_COLUMNS.entryDate.header,
    key: 'entryDate',
    render: (objectWithEnrollment: WithEnrollment) => (
      <DateWithRelativeTooltip
        dateString={objectWithEnrollment.enrollment.entryDate}
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
    render: (objectWithEnrollment: WithEnrollment) => {
      if (objectWithEnrollment.enrollment.exitDate)
        return (
          <DateWithRelativeTooltip
            dateString={objectWithEnrollment.enrollment.exitDate}
            preciseTime={false}
          />
        );
    },
  },
  enrollmentStatus: {
    header: ENROLLMENT_COLUMNS.enrollmentStatus.header,
    key: 'status',
    render: (e) => <EnrollmentStatus enrollment={e.enrollment} />,
  },
  organizationName: {
    header: 'Organization Name',
    key: 'organizationName',
    optional: {
      defaultHidden: true,
      queryVariableField: 'includeOrganizationName',
    },
    render: (e) => {
      return e.enrollment.organizationName;
    },
  },
};

export const WITH_ENROLLMENT_OPTIONAL_COLUMNS: {
  [key: string]: GenericTableWithDataColumnDef<
    WithEnrollment,
    EnrollmentQueryVariables
  >;
} = {
  moveInDate: {
    header: ENROLLMENT_COLUMNS.moveInDate.header,
    key: 'moveInDate',
    optional: {
      defaultHidden: true,
      queryVariableField: 'includeMoveInDate',
    },
    render: (e) => {
      if (e.enrollment.moveInDate) {
        return (
          <DateWithRelativeTooltip
            dateString={e.enrollment.moveInDate}
            preciseTime={false}
          />
        );
      }
    },
  },
  lastContactDate: {
    header: ENROLLMENT_COLUMNS.lastContactDate.header,
    key: 'lastContactDate',
    optional: {
      defaultHidden: true,
      queryVariableField: 'includeLastContact',
    },
    render: (e) => {
      if (e.enrollment.lastContact) {
        return (
          <Box flexDirection='row'>
            <DateWithRelativeTooltip
              dateString={e.enrollment.lastContact.contactDate}
              preciseTime={false}
            />{' '}
            ({HmisEnums.LastContactType[e.enrollment.lastContact.contactType]})
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
      showOptionalColumns
    />
  );
};

export default ProjectClientEnrollmentsTable;
