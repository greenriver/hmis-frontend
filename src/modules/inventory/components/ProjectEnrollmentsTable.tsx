import { Stack, Tooltip, Typography } from '@mui/material';
import { formatISO } from 'date-fns';
import { useCallback, useMemo } from 'react';

import EnrollmentStatus from '@/components/elements/EnrollmentStatus';
import { ColumnDef } from '@/components/elements/GenericTable';
import TextInput from '@/components/elements/input/TextInput';
import useDebouncedState from '@/hooks/useDebouncedState';
import ClientName from '@/modules/client/components/ClientName';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import ClientDobAge from '@/modules/hmis/components/ClientDobAge';
import HohIndicator from '@/modules/hmis/components/HohIndicator';
import {
  formatDateForDisplay,
  parseAndFormatDateRange,
} from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import {
  EnrollmentFieldsFragment,
  GetProjectEnrollmentsDocument,
  GetProjectEnrollmentsQuery,
  GetProjectEnrollmentsQueryVariables,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

export const ENROLLMENT_COLUMNS: {
  [key: string]: ColumnDef<EnrollmentFieldsFragment>;
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
          to: generateSafePath(DashboardRoutes.VIEW_ENROLLMENT, {
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
            {`${e.household.id.slice(0, 6).toUpperCase()} (${e.householdSize})`}
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

const defaultColumns: ColumnDef<EnrollmentFieldsFragment>[] = [
  ENROLLMENT_COLUMNS.clientNameLinkedToEnrollment,
  ENROLLMENT_COLUMNS.enrollmentStatus,
  ENROLLMENT_COLUMNS.enrollmentPeriod,
  ENROLLMENT_COLUMNS.householdId,
];

const ProjectEnrollmentsTable = ({
  projectId,
  columns,
  openOnDate,
  linkRowToEnrollment = false,
}: {
  projectId: string;
  columns?: typeof defaultColumns;
  linkRowToEnrollment?: boolean;
  openOnDate?: Date;
}) => {
  const [search, setSearch, debouncedSearch] = useDebouncedState<
    string | undefined
  >(undefined);

  const rowLinkTo = useCallback(
    (en: EnrollmentFieldsFragment) =>
      generateSafePath(DashboardRoutes.VIEW_ENROLLMENT, {
        clientId: en.client.id,
        enrollmentId: en.id,
      }),
    []
  );

  const openOnDateString = useMemo(
    () =>
      openOnDate
        ? formatISO(openOnDate, { representation: 'date' })
        : undefined,
    [openOnDate]
  );

  return (
    <GenericTableWithData<
      GetProjectEnrollmentsQuery,
      GetProjectEnrollmentsQueryVariables,
      EnrollmentFieldsFragment
    >
      header={
        <TextInput
          label='Search Clients'
          name='search client'
          placeholder='Search clients...'
          value={search || ''}
          onChange={(e) => setSearch(e.target.value)}
          inputWidth='200px'
        />
      }
      queryVariables={{
        id: projectId,
        clientSearchTerm: debouncedSearch,
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
    />
  );
};
export default ProjectEnrollmentsTable;
