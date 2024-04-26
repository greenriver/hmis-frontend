import { Stack, Typography } from '@mui/material';
import { ReactNode, useMemo } from 'react';

import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import EnrollmentClientNameWithAge from '@/modules/hmis/components/EnrollmentClientNameWithAge';
import EnrollmentDateRangeWithStatus from '@/modules/hmis/components/EnrollmentDateRangeWithStatus';
import EnrollmentStatus from '@/modules/hmis/components/EnrollmentStatus';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import HohIndicator from '@/modules/hmis/components/HohIndicator';
import { useFilters } from '@/modules/hmis/filterUtil';
import {
  formatDateForDisplay,
  formatDateForGql,
} from '@/modules/hmis/hmisUtil';
import { HmisEnums } from '@/types/gqlEnums';
import {
  GetProjectHouseholdsDocument,
  GetProjectHouseholdsQuery,
  GetProjectHouseholdsQueryVariables,
  HouseholdFilterOptions,
  RelationshipToHoH,
} from '@/types/gqlTypes';

export type HouseholdFields = NonNullable<
  GetProjectHouseholdsQuery['project']
>['households']['nodes'][number];

const TableCellContainer = ({ children }: { children: ReactNode }) => (
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
    key: 'hoh-indicator',
    render: (hh) => (
      <TableCellContainer>
        {hh.householdClients.map((c) =>
          RelationshipToHoH.SelfHeadOfHousehold === c.relationshipToHoH ? (
            <HohIndicator
              key={c.id}
              sx={{ pl: 0, pt: 0 }}
              relationshipToHoh={c.relationshipToHoH}
            />
          ) : (
            <Typography variant='body2' key={c.id}>
              &#160;
            </Typography>
          )
        )}
      </TableCellContainer>
    ),
  },
  clients: {
    header: 'Clients',
    render: (hh) => (
      <TableCellContainer>
        {hh.householdClients.map((hc) => (
          <EnrollmentClientNameWithAge
            key={hc.id}
            enrollmentId={hc.enrollment.id}
            client={hc.client}
          />
        ))}
      </TableCellContainer>
    ),
  },
  relationshipToHoH: {
    header: 'Relationship to HoH',
    render: (hh) => (
      <TableCellContainer>
        {hh.householdClients.map((c) =>
          c.relationshipToHoH === RelationshipToHoH.DataNotCollected ? (
            <Typography variant='body2' key={c.id}>
              &#160;
            </Typography>
          ) : (
            <HmisEnum
              key={c.id}
              value={c.relationshipToHoH}
              enumMap={HmisEnums.RelationshipToHoH}
              whiteSpace='nowrap'
            />
          )
        )}
      </TableCellContainer>
    ),
  },
  status: {
    header: 'Status',
    render: (hh) => (
      <TableCellContainer>
        {hh.householdClients.map((c) => (
          <EnrollmentStatus key={c.id} enrollment={c.enrollment} />
        ))}
      </TableCellContainer>
    ),
  },
  enrollmentPeriod: {
    header: 'Enrollment Period',
    render: (hh) => (
      <TableCellContainer>
        {hh.householdClients.map((c) => (
          <EnrollmentDateRangeWithStatus
            key={c.id}
            enrollment={c.enrollment}
            treatIncompleteAsActive
          />
        ))}
      </TableCellContainer>
    ),
  },
  householdId: {
    header: 'Household ID',
    render: (hh) => (
      <Typography variant='body2' whiteSpace='nowrap'>
        {hh.shortId} ({hh.householdSize})
      </Typography>
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
}: {
  projectId: string;
  columns?: typeof defaultColumns;
  openOnDate?: Date;
  searchTerm?: string;
}) => {
  const openOnDateString = useMemo(
    () => (openOnDate ? formatDateForGql(openOnDate) : undefined),
    [openOnDate]
  );

  const filters = useFilters({
    type: 'HouseholdFilterOptions',
    omit: ['searchTerm'],
  });

  return (
    <GenericTableWithData<
      GetProjectHouseholdsQuery,
      GetProjectHouseholdsQueryVariables,
      HouseholdFields,
      HouseholdFilterOptions
    >
      queryVariables={{
        id: projectId,
        filters: {
          searchTerm,
          openOnDate: openOnDateString,
        },
      }}
      queryDocument={GetProjectHouseholdsDocument}
      columns={columns || defaultColumns}
      noData={
        openOnDate
          ? `No households open on ${formatDateForDisplay(openOnDate)}`
          : 'No households'
      }
      pagePath='project.households'
      showTopToolbar
      filters={filters}
      recordType='Household'
    />
  );
};
export default ProjectHouseholdsTable;
