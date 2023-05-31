import { Stack, Tooltip, Typography } from '@mui/material';
import { useCallback, useMemo } from 'react';

import EnrollmentStatus from '@/components/elements/EnrollmentStatus';
import { ColumnDef } from '@/components/elements/GenericTable';
import ClientName from '@/modules/client/components/ClientName';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import ClientDobAge from '@/modules/hmis/components/ClientDobAge';
import HohIndicator from '@/modules/hmis/components/HohIndicator';
import {
  formatDateForDisplay,
  formatDateForGql,
  parseAndFormatDateRange,
} from '@/modules/hmis/hmisUtil';
import { ClientDashboardRoutes } from '@/routes/routes';
import {
  EnrollmentSortOption,
  GetProjectEnrollmentsDocument,
  GetProjectEnrollmentsQuery,
  GetProjectEnrollmentsQueryVariables,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

export type EnrollmentFields = NonNullable<
  GetProjectEnrollmentsQuery['project']
>['enrollments']['nodes'][number];

export const ENROLLMENT_COLUMNS: {
  [key: string]: ColumnDef<EnrollmentFields>;
} = {
  clientName: {
    header: 'Client',
    render: (e) => <ClientName client={e.client} />,
    linkTreatment: true,
  },
  clientNameLinkedToEnrollment: {
    header: 'Client',
    render: (e) => (
      <ClientName
        client={e.client}
        routerLinkProps={{
          to: generateSafePath(ClientDashboardRoutes.VIEW_ENROLLMENT, {
            clientId: e.client.id,
            enrollmentId: e.id,
          }),
          target: '_blank',
        }}
      />
    ),
    linkTreatment: true,
  },
  enrollmentStatus: {
    header: 'Status',
    render: (e) => <EnrollmentStatus enrollment={e} />,
  },
  enrollmentPeriod: {
    header: 'Enrollment Period',
    render: (e) => parseAndFormatDateRange(e.entryDate, e.exitDate),
  },
  householdId: {
    header: 'Household ID',
    render: (e) => (
      <Stack direction='row' alignItems='baseline'>
        <Tooltip
          title={`${e.householdSize} member${e.householdSize !== 1 ? 's' : ''}`}
          arrow
        >
          <Typography variant='body2'>
            {`${e.household.shortId} (${e.householdSize})`}
          </Typography>
        </Tooltip>
        {e.householdSize > 1 && (
          <HohIndicator relationshipToHoh={e.relationshipToHoH} />
        )}
      </Stack>
    ),
  },
  dobAge: {
    header: 'DOB / Age',
    key: 'dob',
    render: (e) => <ClientDobAge client={e.client} />,
  },
  clientId: {
    header: 'Client ID',
    key: 'id',
    render: (e) => e.client.id,
  },
};

const defaultColumns: ColumnDef<EnrollmentFields>[] = [
  ENROLLMENT_COLUMNS.clientNameLinkedToEnrollment,
  ENROLLMENT_COLUMNS.enrollmentStatus,
  ENROLLMENT_COLUMNS.enrollmentPeriod,
  ENROLLMENT_COLUMNS.householdId,
];

const ProjectClientEnrollmentsTable = ({
  projectId,
  columns,
  openOnDate,
  linkRowToEnrollment = false,
  searchTerm,
  // TODO: implement, needs a backend flag
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  wipEnrollmentsOnly = false,
}: {
  projectId: string;
  columns?: typeof defaultColumns;
  linkRowToEnrollment?: boolean;
  openOnDate?: Date;
  searchTerm?: string;
  wipEnrollmentsOnly?: boolean;
}) => {
  const rowLinkTo = useCallback(
    (en: EnrollmentFields) =>
      generateSafePath(ClientDashboardRoutes.VIEW_ENROLLMENT, {
        clientId: en.client.id,
        enrollmentId: en.id,
      }),
    []
  );

  const openOnDateString = useMemo(
    () => (openOnDate ? formatDateForGql(openOnDate) : undefined),
    [openOnDate]
  );
  return (
    <GenericTableWithData<
      GetProjectEnrollmentsQuery,
      GetProjectEnrollmentsQueryVariables,
      EnrollmentFields
    >
      queryVariables={{
        id: projectId,
        searchTerm,
        openOnDate: openOnDateString,
      }}
      queryDocument={GetProjectEnrollmentsDocument}
      columns={columns || defaultColumns}
      rowLinkTo={linkRowToEnrollment ? rowLinkTo : undefined}
      noData={
        openOnDate
          ? `No enrollments open on ${formatDateForDisplay(openOnDate)}`
          : 'No clients.'
      }
      pagePath='project.enrollments'
      recordType='Enrollment'
      showFilters
      filterInputType='EnrollmentsForProjectFilterOptions'
      defaultSortOption={EnrollmentSortOption.MostRecent}
    />
  );
};
export default ProjectClientEnrollmentsTable;
