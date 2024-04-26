import { Stack, Tooltip, Typography } from '@mui/material';
import { useCallback, useMemo } from 'react';

import { ColumnDef } from '@/components/elements/table/types';
import ClientName from '@/modules/client/components/ClientName';
import { SsnDobShowContextProvider } from '@/modules/client/providers/ClientSsnDobVisibility';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import EnrollmentClientNameWithAge from '@/modules/hmis/components/EnrollmentClientNameWithAge';
import EnrollmentDateRangeWithStatus from '@/modules/hmis/components/EnrollmentDateRangeWithStatus';

import EnrollmentEntryDateWithStatusIndicator from '@/modules/hmis/components/EnrollmentEntryDateWithStatusIndicator';
import EnrollmentStatus from '@/modules/hmis/components/EnrollmentStatus';
import HohIndicator from '@/modules/hmis/components/HohIndicator';
import { useFilters } from '@/modules/hmis/filterUtil';
import {
  formatDateForDisplay,
  formatDateForGql,
  parseAndFormatDate,
} from '@/modules/hmis/hmisUtil';
import { CLIENT_COLUMNS } from '@/modules/search/components/ClientSearch';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  ClientEnrollmentFieldsFragment,
  EnrollmentFieldsFragment,
  EnrollmentSortOption,
  EnrollmentsForProjectFilterOptions,
  GetProjectEnrollmentsDocument,
  GetProjectEnrollmentsQuery,
  GetProjectEnrollmentsQueryVariables,
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
export const ENROLLMENT_COLUMNS: {
  [key: string]: ColumnDef<
    | EnrollmentFieldsFragment
    | ProjectEnrollmentFieldsFragment
    | ProjectEnrollmentQueryEnrollmentFieldsFragment
  >;
} = {
  clientName: {
    header: 'Client',
    render: (e) => <ClientName client={e.client} />,
    linkTreatment: true,
  },
  clientNameLinkedToEnrollment: {
    header: 'Client',
    render: (e) => <ClientName client={e.client} linkToEnrollmentId={e.id} />,
    linkTreatment: true,
  },
  clientNameLinkedToEnrollmentWithAge: {
    header: 'Client',
    render: (e) => (
      <EnrollmentClientNameWithAge client={e.client} enrollmentId={e.id} />
    ),
    linkTreatment: true,
  },
  firstNameLinkedToEnrollment: {
    header: 'First Name',
    render: (e) => (
      <ClientName
        client={e.client}
        linkToEnrollmentId={e.id}
        nameParts='first_only'
      />
    ),
    linkTreatment: true,
  },
  lastNameLinkedToEnrollment: {
    header: 'Last Name',
    render: (e) => (
      <ClientName
        client={e.client}
        linkToEnrollmentId={e.id}
        nameParts='last_only'
      />
    ),
    linkTreatment: true,
  },
  enrollmentStatus: ENROLLMENT_STATUS_COL,
  entryDate: {
    header: 'Entry Date',
    // should only be used for open enrollments, because it doesnt indicate if closed or not
    render: (e) => <EnrollmentEntryDateWithStatusIndicator enrollment={e} />,
  },
  enrollmentPeriod: ENROLLMENT_PERIOD_COL,
  householdId: {
    header: 'Household ID',
    key: 'housholdId',
    optional: true,
    render: (e) => (
      <Stack direction='row' alignItems='baseline'>
        <Tooltip
          title={`${e.householdSize} member${e.householdSize !== 1 ? 's' : ''}`}
          arrow
        >
          <Typography variant='body2'>
            {`${e.householdShortId} (${e.householdSize})`}
          </Typography>
        </Tooltip>
        {e.householdSize > 1 && (
          <HohIndicator relationshipToHoh={e.relationshipToHoH} />
        )}
      </Stack>
    ),
  },
  clientId: {
    header: 'Client ID',
    key: 'id',
    render: (e) => e.client.id,
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
};

const ProjectClientEnrollmentsTable = ({
  projectId,
  columns,
  openOnDate,
  linkRowToEnrollment = false,
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
  const rowLinkTo = useCallback(
    (en: EnrollmentFields) =>
      generateSafePath(EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW, {
        clientId: en.client.id,
        enrollmentId: en.id,
      }),
    []
  );

  const openOnDateString = useMemo(
    () => (openOnDate ? formatDateForGql(openOnDate) : undefined),
    [openOnDate]
  );

  const defaultColumns: ColumnDef<ProjectEnrollmentQueryEnrollmentFieldsFragment>[] =
    useMemo(() => {
      return [
        ENROLLMENT_COLUMNS.clientNameLinkedToEnrollment,
        CLIENT_COLUMNS.dobAge,
        ENROLLMENT_COLUMNS.enrollmentStatus,
        ENROLLMENT_COLUMNS.enrollmentPeriod,
        ENROLLMENT_COLUMNS.lastClsDate,
      ];
    }, []);

  const filters = useFilters({
    type: 'EnrollmentsForProjectFilterOptions',
    omit: ['searchTerm', 'bedNightOnDate'],
  });

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
        rowLinkTo={linkRowToEnrollment ? rowLinkTo : undefined}
        noData={
          openOnDate
            ? `No enrollments open on ${formatDateForDisplay(openOnDate)}`
            : 'No enrollments'
        }
        pagePath='project.enrollments'
        recordType='Enrollment'
        showTopToolbar
        filters={filters}
        defaultSortOption={EnrollmentSortOption.MostRecent}
        showOptionalColumns
        applyOptionalColumns={(cols) => {
          const result: Partial<GetProjectEnrollmentsQueryVariables> = {};

          if (cols.includes(ENROLLMENT_COLUMNS.lastClsDate.key || ''))
            result.includeCls = true;

          return result;
        }}
      />
    </SsnDobShowContextProvider>
  );
};
export default ProjectClientEnrollmentsTable;
