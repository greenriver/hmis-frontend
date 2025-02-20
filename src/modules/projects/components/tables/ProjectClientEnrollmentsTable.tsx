import { Box, Chip, Tooltip } from '@mui/material';
import React, { useMemo } from 'react';
import DateWithRelativeTooltip from '@/components/elements/DateWithRelativeTooltip';
import {
  getViewClientMenuItem,
  getViewEnrollmentMenuItem,
} from '@/components/elements/table/tableRowActionUtil';
import { ColumnDef, getColumnKey } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { ClientEnrollmentTableFields } from '@/modules/enrollment/components/pages/ClientEnrollmentsPage';
import EnrollmentStatus from '@/modules/hmis/components/EnrollmentStatus';
import { useFilters } from '@/modules/hmis/filterUtil';
import {
  clientBriefName,
  formatDateForDisplay,
  formatDateForGql,
} from '@/modules/hmis/hmisUtil';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { CLIENT_COLUMNS } from '@/modules/search/components/ClientSearch';
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
  ProjectEnrollmentQueryEnrollmentFieldsFragment,
} from '@/types/gqlTypes';

export type ProjectEnrollmentFields = NonNullable<
  GetProjectEnrollmentsQuery['project']
>['enrollments']['nodes'][number];

const isHouseholdWithStaff = (
  e: any
): e is { household: HouseholdWithStaffAssignmentsFragment } => {
  return 'household' in e && 'staffAssignments' in e.household;
};

export const HOUSEHOLD_ASSIGNED_STAFF_COL = {
  header: 'Assigned Staff',
  optional: true,
  defaultHidden: true,
  key: 'assigned_staff',
  render: (hh: HouseholdWithStaffAssignmentsFragment) => {
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
            <Chip
              sx={{ mb: 0.5 }}
              size='small'
              label={`+${rest.length} more`}
            />
          </Tooltip>
        )}
      </Box>
    );
  },
};

export const ENROLLMENT_COLUMNS: {
  [key: string]: ColumnDef<
    | ClientEnrollmentTableFields
    | ProjectEnrollmentQueryEnrollmentFieldsFragment
    | ClientEnrollmentFieldsFragment
  >;
} = {
  entryDate: {
    header: 'Entry Date',
    render: (e) => (
      <DateWithRelativeTooltip dateString={e.entryDate} preciseTime={false} />
    ),
  },
  exitDate: {
    header: 'Exit Date',
    optional: true,
    defaultHidden: true,
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
    render: (e) => <EnrollmentStatus enrollment={e} />,
  },
  moveInDate: {
    header: 'Move-in Date',
    optional: true,
    defaultHidden: true,
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
    optional: true,
    defaultHidden: true,
    render: (e) => {
      if ('lastContact' in e && e.lastContact) {
        return (
          <Box flexDirection='row'>
            <DateWithRelativeTooltip
              dateString={e.lastContact.date}
              preciseTime={false}
            />{' '}
            ({e.lastContact.type})
          </Box>
        );
      }
    },
  },
  assignedStaff: {
    ...HOUSEHOLD_ASSIGNED_STAFF_COL,
    render: (e) => {
      return isHouseholdWithStaff(e)
        ? HOUSEHOLD_ASSIGNED_STAFF_COL.render(e.household)
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
  [key: string]: ColumnDef<WithEnrollment>;
} = {
  entryDate: {
    header: ENROLLMENT_COLUMNS.entryDate.header,
    render: (objectWithEnrollment: WithEnrollment) => (
      <DateWithRelativeTooltip
        dateString={objectWithEnrollment.enrollment.entryDate}
        preciseTime={false}
      />
    ),
  },
  exitDate: {
    header: ENROLLMENT_COLUMNS.exitDate.header,
    optional: true,
    defaultHidden: true,
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
    render: (e) => <EnrollmentStatus enrollment={e.enrollment} />,
  },
  moveInDate: {
    header: ENROLLMENT_COLUMNS.moveInDate.header,
    optional: true,
    defaultHidden: true,
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
    optional: true,
    defaultHidden: true,
    render: (e) => {
      if (e.enrollment.lastContact) {
        return (
          <Box flexDirection='row'>
            <DateWithRelativeTooltip
              dateString={e.enrollment.lastContact.date}
              preciseTime={false}
            />{' '}
            ({e.enrollment.lastContact.type})
          </Box>
        );
      }
    },
  },
  organizationName: {
    header: 'Organization Name',
    optional: true,
    defaultHidden: true,
    render: (e) => {
      return e.enrollment.organizationName;
    },
  },
};

const ProjectClientEnrollmentsTable = ({
  projectId,
  openOnDate,
  searchTerm,
}: {
  projectId: string;
  linkRowToEnrollment?: boolean;
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
    project: { staffAssignmentsEnabled },
  } = useProjectDashboardContext();

  const columns: ColumnDef<ProjectEnrollmentQueryEnrollmentFieldsFragment>[] =
    useMemo(() => {
      return [
        { ...CLIENT_COLUMNS.name, sticky: 'left' },
        CLIENT_COLUMNS.age,
        ENROLLMENT_COLUMNS.entryDate,
        ENROLLMENT_COLUMNS.exitDate,
        ENROLLMENT_COLUMNS.enrollmentStatus,
        ENROLLMENT_COLUMNS.moveInDate,
        ENROLLMENT_COLUMNS.lastContactDate,
        ...(staffAssignmentsEnabled ? [ENROLLMENT_COLUMNS.assignedStaff] : []),
      ];
    }, [staffAssignmentsEnabled]);

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
      applyOptionalColumns={(cols) => {
        const result: Partial<GetProjectEnrollmentsQueryVariables> = {};

        if (cols.includes(getColumnKey(HOUSEHOLD_ASSIGNED_STAFF_COL)))
          result.includeStaffAssignment = true;

        if (cols.includes(getColumnKey(ENROLLMENT_COLUMNS.moveInDate)))
          result.includeMoveInDate = true;

        if (cols.includes(getColumnKey(ENROLLMENT_COLUMNS.lastContactDate)))
          result.includeLastContact = true;

        return result;
      }}
    />
  );
};

export default ProjectClientEnrollmentsTable;
