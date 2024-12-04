import { useMemo } from 'react';

import { ColumnDef } from '@/components/elements/table/types';
import { SsnDobShowContextProvider } from '@/modules/client/providers/ClientSsnDobVisibility';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import EnrollmentDateRangeWithStatus from '@/modules/hmis/components/EnrollmentDateRangeWithStatus';
import EnrollmentStatus from '@/modules/hmis/components/EnrollmentStatus';
import { useFilters } from '@/modules/hmis/filterUtil';
import {
  clientBriefName,
  formatDateForDisplay,
  formatDateForGql,
  parseAndFormatDate,
} from '@/modules/hmis/hmisUtil';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { ASSIGNED_STAFF_COL } from '@/modules/projects/components/tables/ProjectHouseholdsTable';
import { CLIENT_COLUMNS } from '@/modules/search/components/ClientSearch';
import {
  ClientDashboardRoutes,
  EnrollmentDashboardRoutes,
} from '@/routes/routes';
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
import { generateSafePath } from '@/utils/pathEncoding';

export type EnrollmentFields = NonNullable<
  GetProjectEnrollmentsQuery['project']
>['enrollments']['nodes'][number];

export const ENROLLMENT_STATUS_COL: ColumnDef<
  | EnrollmentFieldsFragment
  | ProjectEnrollmentFieldsFragment
  | ClientEnrollmentFieldsFragment
> = {
  header: 'Status',
  render: (e) => <EnrollmentStatus enrollment={e} />,
};

// TODO @martha (#6761) - the this is now only used in the client card. Reorganize where column defs live
export const ENROLLMENT_PERIOD_COL: ColumnDef<
  | EnrollmentFieldsFragment
  | ProjectEnrollmentFieldsFragment
  | ClientEnrollmentFieldsFragment
> = {
  header: 'Enrollment Period',
  render: (e) => (
    <EnrollmentDateRangeWithStatus enrollment={e} treatIncompleteAsActive />
  ),
};

const isHouseholdWithStaff = (
  e: any
): e is { household: HouseholdWithStaffAssignmentsFragment } => {
  return 'household' in e && 'staffAssignments' in e.household;
};

export const ENROLLMENT_COLUMNS: {
  [key: string]: ColumnDef<
    | EnrollmentFieldsFragment
    | ProjectEnrollmentFieldsFragment
    | ProjectEnrollmentQueryEnrollmentFieldsFragment
  >;
} = {
  enrollmentStatus: ENROLLMENT_STATUS_COL,
  entryDate: {
    header: 'Entry Date',
    render: (e) => parseAndFormatDate(e.entryDate),
  },
  exitDate: {
    header: 'Exit Date',
    render: (e) => parseAndFormatDate(e.exitDate),
  },
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
      const cols = [
        CLIENT_COLUMNS.name,
        CLIENT_COLUMNS.age,
        ENROLLMENT_COLUMNS.entryDate,
        ENROLLMENT_COLUMNS.exitDate,
        ENROLLMENT_COLUMNS.enrollmentStatus,
      ];

      if (staffAssignmentsEnabled) cols.push(ENROLLMENT_COLUMNS.assignedStaff);

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

  const tableRowActions = useMemo(
    () => [
      {
        title: 'View Enrollment',
        key: 'enrollment',
        getUrl: (enrollment: ProjectEnrollmentQueryEnrollmentFieldsFragment) =>
          generateSafePath(EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW, {
            clientId: enrollment.client.id,
            enrollmentId: enrollment.id,
          }),
      },
      {
        title: 'View Client',
        key: 'client',
        getUrl: (enrollment) =>
          generateSafePath(ClientDashboardRoutes.PROFILE, {
            clientId: enrollment.client.id,
          }),
      },
    ],
    []
  );

  return (
    <SsnDobShowContextProvider>
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

          if (cols.includes(ENROLLMENT_COLUMNS.lastClsDate.key || ''))
            result.includeCls = true;

          if (cols.includes(ENROLLMENT_COLUMNS.assignedStaff.key || ''))
            result.includeStaffAssignment = true;

          return result;
        }}
        tableRowActions={tableRowActions}
        getRowAccessibleName={(
          enrollment: ProjectEnrollmentQueryEnrollmentFieldsFragment
        ) => clientBriefName(enrollment.client)}
      />
    </SsnDobShowContextProvider>
  );
};
export default ProjectClientEnrollmentsTable;
