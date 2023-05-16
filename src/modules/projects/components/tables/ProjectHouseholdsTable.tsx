import { Box, Link, Stack, Typography } from '@mui/material';
import { formatISO } from 'date-fns';
import { ReactNode, useMemo } from 'react';

import EnrollmentStatus from '@/components/elements/EnrollmentStatus';
import { ColumnDef } from '@/components/elements/GenericTable';
import ClientName from '@/modules/client/components/ClientName';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import ClientDobAge from '@/modules/hmis/components/ClientDobAge';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import HohIndicator from '@/modules/hmis/components/HohIndicator';
import {
  formatDateForDisplay,
  parseAndFormatDateRange,
} from '@/modules/hmis/hmisUtil';
import { ClientDashboardRoutes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  EnrollmentLimit,
  GetProjectHouseholdsDocument,
  GetProjectHouseholdsQuery,
  GetProjectHouseholdsQueryVariables,
  RelationshipToHoH,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

export type HouseholdFields = NonNullable<
  GetProjectHouseholdsQuery['project']
>['households']['nodes'][number];

const TableCellConatiner = ({ children }: { children: ReactNode }) => (
  <Stack direction='column' gap={1} sx={{ py: 1 }}>
    {children}
  </Stack>
);

export const HOUSEHOLD_COLUMNS: {
  [key: string]: ColumnDef<HouseholdFields>;
} = {
  hohIndicator: {
    header: ' ',
    width: '0%',
    render: (hh) => (
      <TableCellConatiner>
        {hh.householdClients.map((c) =>
          RelationshipToHoH.SelfHeadOfHousehold === c.relationshipToHoH ? (
            <HohIndicator
              key={c.id}
              sx={{ pl: 0, pt: 0 }}
              relationshipToHoh={c.relationshipToHoH}
            />
          ) : (
            <Typography variant='body2'>&#160;</Typography>
          )
        )}
      </TableCellConatiner>
    ),
  },
  clients: {
    header: 'Clients',
    render: (hh) => (
      <TableCellConatiner>
        {hh.householdClients.map((c) => (
          <Stack
            key={c.id}
            direction='row'
            gap={0.5}
            whiteSpace='nowrap'
            component={Link}
            href={generateSafePath(ClientDashboardRoutes.VIEW_ENROLLMENT, {
              clientId: c.client.id,
              enrollmentId: c.enrollment.id,
            })}
            target='_blank'
          >
            <ClientName client={c.client} />
            <ClientDobAge client={c.client} noDob />
          </Stack>
        ))}
      </TableCellConatiner>
    ),
  },
  relationshipToHoH: {
    header: 'Relationship to HoH',
    render: (hh) => (
      <TableCellConatiner>
        {hh.householdClients.map((c) =>
          c.relationshipToHoH === RelationshipToHoH.DataNotCollected ? (
            <Typography variant='body2'>&#160;</Typography>
          ) : (
            <HmisEnum
              key={c.id}
              value={c.relationshipToHoH}
              enumMap={{
                ...HmisEnums.RelationshipToHoH,
                [RelationshipToHoH.SelfHeadOfHousehold]: 'Self (HoH)',
              }}
              whiteSpace='nowrap'
            />
          )
        )}
      </TableCellConatiner>
    ),
  },
  status: {
    header: 'Status',
    render: (hh) => (
      <TableCellConatiner>
        {hh.householdClients.map((c) => (
          <EnrollmentStatus key={c.id} enrollment={c.enrollment} />
        ))}
      </TableCellConatiner>
    ),
  },
  enrollmentPeriod: {
    header: 'Enrollment Period',
    render: (hh) => (
      <TableCellConatiner>
        {hh.householdClients.map((c) => (
          <Typography key={c.id} variant='body2' whiteSpace='nowrap'>
            {parseAndFormatDateRange(
              c.enrollment.entryDate,
              c.enrollment.exitDate
            )}
          </Typography>
        ))}
      </TableCellConatiner>
    ),
  },
  householdId: {
    header: 'Household ID',
    render: (hh) => (
      <Box height='100%'>
        <Typography variant='body2' whiteSpace='nowrap'>
          {hh.shortId} ({hh.householdSize})
        </Typography>
      </Box>
    ),
  },
};

const defaultColumns: ColumnDef<HouseholdFields>[] = [
  HOUSEHOLD_COLUMNS.hohIndicator,
  HOUSEHOLD_COLUMNS.clients,
  HOUSEHOLD_COLUMNS.relationshipToHoH,
  HOUSEHOLD_COLUMNS.status,
  HOUSEHOLD_COLUMNS.enrollmentPeriod,
  HOUSEHOLD_COLUMNS.householdId,
];

const ProjectHouseholdsTable = ({
  projectId,
  columns,
  openOnDate,
  searchTerm,
  wipEnrollmentsOnly = false,
}: {
  projectId: string;
  columns?: typeof defaultColumns;
  openOnDate?: Date;
  searchTerm?: string;
  wipEnrollmentsOnly?: boolean;
}) => {
  const openOnDateString = useMemo(
    () =>
      openOnDate
        ? formatISO(openOnDate, { representation: 'date' })
        : undefined,
    [openOnDate]
  );

  return (
    <GenericTableWithData<
      GetProjectHouseholdsQuery,
      GetProjectHouseholdsQueryVariables,
      HouseholdFields
    >
      queryVariables={{
        id: projectId,
        searchTerm,
        openOnDate: openOnDateString,
        enrollmentLimit: wipEnrollmentsOnly
          ? EnrollmentLimit.WipOnly
          : undefined,
      }}
      queryDocument={GetProjectHouseholdsDocument}
      columns={columns || defaultColumns}
      noData={
        openOnDate
          ? `No enrollments open on ${formatDateForDisplay(openOnDate)}`
          : 'No clients.'
      }
      pagePath='project.households'
    />
  );
};
export default ProjectHouseholdsTable;
