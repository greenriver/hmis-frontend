import { useMemo } from 'react';

import {
  getViewClientAction,
  getViewEnrollmentAction,
} from '@/components/elements/table/tableActions/tableRowActionUtil';
import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import DateWithRelativeTooltip from '@/modules/hmis/components/DateWithRelativeTooltip';
import EnrollmentStatus from '@/modules/hmis/components/EnrollmentStatus';
import { useFilters } from '@/modules/hmis/filterUtil';
import {
  clientBriefName,
  entryExitRange,
  formatDateForDisplay,
  formatDateForGql,
  parseAndFormatDate,
} from '@/modules/hmis/hmisUtil';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { ASSIGNED_STAFF_COL } from '@/modules/projects/components/tables/ProjectHouseholdsTable';
import { CLIENT_COLUMNS } from '@/modules/search/components/ClientSearch';
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

export const WITH_ENROLLMENT_COLUMNS: {
  [key: string]: ColumnDef<any>;
} = {
  entryDate: {
    ...ENROLLMENT_COLUMNS.entryDate,
    render: (objectWithEnrollment: any) => (
      <DateWithRelativeTooltip
        dateString={objectWithEnrollment.enrollment.entryDate}
        preciseTime={false}
      />
    ),
  },
  exitDate: {
    ...ENROLLMENT_COLUMNS.exitDate,
    render: (objectWithEnrollment: any) => {
      if (objectWithEnrollment.enrollment.exitDate)
        return (
          <DateWithRelativeTooltip
            dateString={objectWithEnrollment.enrollment.exitDate}
            preciseTime={false}
          />
        );
    },
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

const getTableRowActions = (
  enrollment: ProjectEnrollmentQueryEnrollmentFieldsFragment
) => {
  return {
    primaryAction: getViewEnrollmentAction(enrollment, enrollment.client),
    secondaryActions: [getViewClientAction(enrollment.client)],
  };
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
      const cols = [
        CLIENT_COLUMNS.name,
        CLIENT_COLUMNS.age,
        ENROLLMENT_COLUMNS.entryDate,
        ENROLLMENT_COLUMNS.exitDate,
        ENROLLMENT_COLUMNS.enrollmentStatus,
      ];

      if (staffAssignmentsEnabled) cols.push(COLUMNS.assignedStaff);

      return cols;
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
      getTableRowActions={getTableRowActions}
      getRowAccessibleName={(
        enrollment: ProjectEnrollmentQueryEnrollmentFieldsFragment
      ) =>
        `${clientBriefName(enrollment.client)} ${entryExitRange(enrollment)}`
      }
    />
  );
};

export default ProjectClientEnrollmentsTable;
