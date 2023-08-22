import { Stack, Tooltip, Typography } from '@mui/material';
import { omit } from 'lodash-es';
import { useCallback, useMemo } from 'react';

import { ColumnDef } from '@/components/elements/table/types';
import ClientName from '@/modules/client/components/ClientName';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import ClientDobAge from '@/modules/hmis/components/ClientDobAge';
import EnrollmentEntryDateWIthStatusIndicator from '@/modules/hmis/components/EnrollmentEntryDateWIthStatusIndicator';
import EnrollmentStatus from '@/modules/hmis/components/EnrollmentStatus';
import HohIndicator from '@/modules/hmis/components/HohIndicator';
import {
  formatDateForDisplay,
  formatDateForGql,
  parseAndFormatDateRange,
} from '@/modules/hmis/hmisUtil';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  EnrollmentFilterOptionStatus,
  EnrollmentSortOption,
  EnrollmentsForProjectFilterOptions,
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
    render: (e) => <ClientName client={e.client} linkToEnrollmentId={e.id} />,
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
  enrollmentStatus: {
    header: 'Status',
    render: (e) => <EnrollmentStatus enrollment={e} />,
  },
  entryDate: {
    header: 'Entry Date',
    // should only be used for open enrollments, because it doesnt indicate if closed or not
    render: (e) => <EnrollmentEntryDateWIthStatusIndicator enrollment={e} />,
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
            {`${e.householdShortId} (${e.householdSize})`}
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
}: {
  projectId: string;
  columns?: typeof defaultColumns;
  linkRowToEnrollment?: boolean;
  openOnDate?: Date;
  searchTerm?: string;
}) => {
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
      rowLinkTo={linkRowToEnrollment ? rowLinkTo : undefined}
      noData={
        openOnDate
          ? `No enrollments open on ${formatDateForDisplay(openOnDate)}`
          : 'No enrollments'
      }
      pagePath='project.enrollments'
      recordType='Enrollment'
      showFilters
      filters={(f) => omit(f, 'searchTerm', 'bedNightOnDate')}
      filterInputType='EnrollmentsForProjectFilterOptions'
      defaultSortOption={EnrollmentSortOption.MostRecent}
      defaultFilters={{
        status: [
          EnrollmentFilterOptionStatus.Active,
          EnrollmentFilterOptionStatus.Incomplete,
        ],
      }}
    />
  );
};
export default ProjectClientEnrollmentsTable;
