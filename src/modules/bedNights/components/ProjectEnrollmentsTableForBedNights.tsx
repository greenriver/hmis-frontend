import { isDate } from 'date-fns';
import { omit } from 'lodash-es';
import { useCallback, useMemo } from 'react';

import { ENROLLMENT_COLUMNS } from '../../projects/components/tables/ProjectClientEnrollmentsTable';
import NotCollectedText from '@/components/elements/NotCollectedText';
import { EnhancedTableToolbarProps } from '@/components/elements/table/EnhancedTableToolbar';
import { ColumnDef } from '@/components/elements/table/types';
import { SsnDobShowContextProvider } from '@/modules/client/providers/ClientSsnDobVisibility';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import {
  formatDateForDisplay,
  formatDateForGql,
  formatRelativeDate,
  parseHmisDateString,
} from '@/modules/hmis/hmisUtil';
import { CLIENT_COLUMNS } from '@/modules/search/components/ClientSearch';
import {
  EnrollmentFilterOptionStatus,
  EnrollmentSortOption,
  EnrollmentsForProjectFilterOptions,
  GetProjectEnrollmentsForBedNightsDocument,
  GetProjectEnrollmentsForBedNightsQuery,
  GetProjectEnrollmentsForBedNightsQueryVariables,
} from '@/types/gqlTypes';

export type EnrollmentFields = NonNullable<
  GetProjectEnrollmentsForBedNightsQuery['project']
>['enrollments']['nodes'][number];

const ProjectEnrollmentsTableForBedNights = ({
  projectId,
  searchTerm,
  editable,
  openOnDate,
  additionalColumns,
  renderBulkAction,
}: {
  projectId: string;
  searchTerm?: string;
  editable?: boolean;
  openOnDate: Date;
  additionalColumns?: ColumnDef<EnrollmentFields>[];
  renderBulkAction?: EnhancedTableToolbarProps<EnrollmentFields>['renderBulkAction'];
}) => {
  const queryVariables = useMemo(
    () => ({
      id: projectId,
      filters: {
        searchTerm,
        openOnDate: formatDateForGql(openOnDate),
      },
    }),
    [projectId, searchTerm, openOnDate]
  );

  const columns = useMemo(() => {
    const defaultColumns: ColumnDef<EnrollmentFields>[] = [
      ENROLLMENT_COLUMNS.firstNameLinkedToEnrollment,
      ENROLLMENT_COLUMNS.lastNameLinkedToEnrollment,
      CLIENT_COLUMNS.ssn,
      CLIENT_COLUMNS.dobAge,
      ENROLLMENT_COLUMNS.entryDate,
      ENROLLMENT_COLUMNS.householdId,
      {
        header: 'Last Bed Night',
        key: 'last-bed-night',
        render: (e) => {
          const noBedNight = (
            <NotCollectedText variant='inherit' color='text.disabled'>
              No Previous Bed Night
            </NotCollectedText>
          );
          if (!e.lastBedNightDate) return noBedNight;
          const dt = parseHmisDateString(e.lastBedNightDate);
          if (!dt) return noBedNight;
          const relative = formatRelativeDate(dt);
          const formatted = formatDateForDisplay(dt);
          return `${relative} (${formatted})`;
        },
      },
    ];

    if (!additionalColumns) return defaultColumns;
    return [...defaultColumns, ...additionalColumns];
  }, [additionalColumns]);

  const noResultsDisplay = useCallback(
    (filters: EnrollmentsForProjectFilterOptions) => {
      const dateDisplay =
        filters.bedNightOnDate && isDate(filters.bedNightOnDate)
          ? formatDateForDisplay(filters.bedNightOnDate as unknown as Date)
          : null;

      const enrolledDate = formatDateForDisplay(openOnDate);
      if (!dateDisplay)
        return (
          <>{`No clients enrolled on ${formatDateForDisplay(openOnDate)}`}</>
        );
      return (
        <>
          {enrolledDate === dateDisplay
            ? `No clients with bed nights on ${dateDisplay}`
            : `No clients enrolled on ${enrolledDate} with bed nights on ${dateDisplay}`}
        </>
      );
    },
    [openOnDate]
  );

  return (
    <SsnDobShowContextProvider>
      <GenericTableWithData<
        GetProjectEnrollmentsForBedNightsQuery,
        GetProjectEnrollmentsForBedNightsQueryVariables,
        EnrollmentFields,
        EnrollmentsForProjectFilterOptions
      >
        queryVariables={queryVariables}
        queryDocument={GetProjectEnrollmentsForBedNightsDocument}
        columns={columns}
        pagePath='project.enrollments'
        recordType='Enrollment'
        showFilters
        filters={(f) => omit(f, 'searchTerm', 'status', 'openOnDate')}
        filterInputType='EnrollmentsForProjectFilterOptions'
        defaultSortOption={EnrollmentSortOption.MostRecent}
        defaultFilters={{
          status: [
            EnrollmentFilterOptionStatus.Active,
            EnrollmentFilterOptionStatus.Incomplete,
          ],
        }}
        noData={noResultsDisplay}
        selectable={editable ? 'checkbox' : undefined}
        defaultPageSize={25}
        rowsPerPageOptions={[25, 50, 100, 150, 200]}
        EnhancedTableToolbarProps={{
          title: 'Enrolled Clients',
          renderBulkAction,
        }}
      />
    </SsnDobShowContextProvider>
  );
};
export default ProjectEnrollmentsTableForBedNights;
