import { Box, Chip, Tooltip } from '@mui/material';
import React, { useMemo } from 'react';
import DateWithRelativeTooltip from '@/components/elements/DateWithRelativeTooltip';
import {
  getViewClientMenuItem,
  getViewEnrollmentMenuItem,
} from '@/components/elements/table/tableRowActionUtil';
import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import EnrollmentStatus from '@/modules/hmis/components/EnrollmentStatus';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { useFilters } from '@/modules/hmis/filterUtil';
import {
  clientBriefName,
  formatDateForDisplay,
  formatDateForGql,
  parseAndFormatDate,
} from '@/modules/hmis/hmisUtil';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { CLIENT_COLUMNS } from '@/modules/search/components/ClientSearch';
import { HmisEnums } from '@/types/gqlEnums';
import {
  ClientEnrollmentFieldsFragment,
  EnrollmentFieldsFragment,
  EnrollmentsForProjectFilterOptions,
  EnrollmentSortOption,
  GetProjectEnrollmentsDocument,
  GetProjectEnrollmentsQuery,
  GetProjectEnrollmentsQueryVariables,
  HouseholdWithStaffAssignmentsFragment,
  ProjectEnrollmentFieldsFragment,
  ProjectEnrollmentQueryEnrollmentFieldsFragment,
} from '@/types/gqlTypes';

export type EnrollmentFields = NonNullable<
  GetProjectEnrollmentsQuery['project']
>['enrollments']['nodes'][number];

const isHouseholdWithStaff = (
  e: any
): e is { household: HouseholdWithStaffAssignmentsFragment } => {
  return 'household' in e && 'staffAssignments' in e.household;
};

export const ENROLLMENT_COLUMNS: {
  [key: string]: ColumnDef<
    | ClientEnrollmentFieldsFragment
    | ProjectEnrollmentQueryEnrollmentFieldsFragment
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
    render: (e) => {
      if (e.exitDate)
        return (
          <DateWithRelativeTooltip
            dateString={e.exitDate}
            preciseTime={false}
          />
        );
    },
  },
  enrollmentStatus: {
    header: 'Status',
    render: (e) => <EnrollmentStatus enrollment={e} />,
  },
};

export const ENROLLMENT_RELATIONSHIP_COL = {
  header: 'Relationship',
  render: (e: Pick<EnrollmentFields, 'id' | 'relationshipToHoH'>) => (
    <HmisEnum
      key={e.id}
      value={e.relationshipToHoH}
      enumMap={{
        ...HmisEnums.RelationshipToHoH,
        // Display "HoH", instead of "Self (HoH)"
        SELF_HEAD_OF_HOUSEHOLD: 'HoH',
      }}
      whiteSpace='nowrap'
    />
  ),
};

export const ASSIGNED_STAFF_COL = {
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

type WithEnrollment = {
  enrollment: Pick<
    EnrollmentFieldsFragment,
    'entryDate' | 'exitDate' | 'inProgress'
  > &
    Partial<Pick<EnrollmentFieldsFragment, 'autoExited'>>;
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
};

const COLUMNS: {
  [key: string]: ColumnDef<
    | EnrollmentFieldsFragment
    | ProjectEnrollmentFieldsFragment
    | ProjectEnrollmentQueryEnrollmentFieldsFragment
    | ClientEnrollmentFieldsFragment
  >;
} = {
  lastClsDate: {
    header: 'Last Current Living Situation Date',
    key: 'lastClsDate',
    optional: true,
    defaultHidden: true,
    render: (e) => {
      if ('lastCurrentLivingSituation' in e) {
        const cls = e.lastCurrentLivingSituation;
        return cls ? parseAndFormatDate(cls.informationDate) : null;
      }
      return null;
    },
  },
  assignedStaff: {
    ...ASSIGNED_STAFF_COL,
    render: (e) => {
      return isHouseholdWithStaff(e)
        ? ASSIGNED_STAFF_COL.render(e.household)
        : null;
    },
  },
};

const ProjectClientEnrollmentsTable = ({
  projectId,
  columns,
  openOnDate,
  searchTerm,
}: {
  projectId: string;
  columns?: ColumnDef<ProjectEnrollmentQueryEnrollmentFieldsFragment>[];
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

  const defaultColumns: ColumnDef<ProjectEnrollmentQueryEnrollmentFieldsFragment>[] =
    useMemo(() => {
      return [
        { ...CLIENT_COLUMNS.name, sticky: 'left' },
        CLIENT_COLUMNS.age,
        ENROLLMENT_RELATIONSHIP_COL,
        ENROLLMENT_COLUMNS.entryDate,
        ENROLLMENT_COLUMNS.exitDate,
        ENROLLMENT_COLUMNS.enrollmentStatus,
        ...(staffAssignmentsEnabled ? [COLUMNS.assignedStaff] : []),
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
      EnrollmentFields,
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
      columns={columns || defaultColumns}
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

        if (cols.includes(COLUMNS.lastClsDate.key || ''))
          result.includeCls = true;

        if (cols.includes(COLUMNS.assignedStaff.key || ''))
          result.includeStaffAssignment = true;

        return result;
      }}
    />
  );
};

export default ProjectClientEnrollmentsTable;
