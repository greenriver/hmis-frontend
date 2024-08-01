import { Chip, Stack, Typography } from '@mui/material';
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
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { HmisEnums } from '@/types/gqlEnums';
import {
  GetProjectHouseholdsDocument,
  GetProjectHouseholdsQuery,
  GetProjectHouseholdsQueryVariables,
  HouseholdFilterOptions,
  HouseholdWithStaffAssignmentsFragment,
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

export const ASSIGNED_STAFF_COL = {
  header: 'Assigned Staff',
  optional: true,
  defaultHidden: true,
  render: (hh: HouseholdWithStaffAssignmentsFragment) => {
    if (!hh.staffAssignments?.nodes.length) return;

    const first = hh.staffAssignments.nodes[0].user.name;
    const rest = hh.staffAssignments.nodesCount - 1;

    return (
      <>
        {first}{' '}
        {rest > 0 && (
          <Chip sx={{ mb: 0.5 }} size='small' label={`+${rest} more`} />
        )}
      </>
    );
  },
};

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
  assignedStaff: ASSIGNED_STAFF_COL,
};

const ProjectHouseholdsTable = ({
  projectId,
  columns,
  openOnDate,
  searchTerm,
}: {
  projectId: string;
  columns?: ColumnDef<HouseholdFields>[];
  openOnDate?: Date;
  searchTerm?: string;
}) => {
  const openOnDateString = useMemo(
    () => (openOnDate ? formatDateForGql(openOnDate) : undefined),
    [openOnDate]
  );

  const {
    project: { staffAssignmentsEnabled },
  } = useProjectDashboardContext();

  const defaultColumns: ColumnDef<HouseholdFields>[] = useMemo(() => {
    const c: ColumnDef<HouseholdFields>[] = [
      HOUSEHOLD_COLUMNS.hohIndicator,
      HOUSEHOLD_COLUMNS.clients,
      HOUSEHOLD_COLUMNS.relationshipToHoH,
      HOUSEHOLD_COLUMNS.status,
      HOUSEHOLD_COLUMNS.enrollmentPeriod,
      HOUSEHOLD_COLUMNS.householdId,
    ];

    if (staffAssignmentsEnabled) c.push(HOUSEHOLD_COLUMNS.assignedStaff);

    return c;
  }, [staffAssignmentsEnabled]);

  const filters = useFilters({
    type: 'HouseholdFilterOptions',
    omit: ['searchTerm', staffAssignmentsEnabled ? '' : 'assignedStaff'],
    pickListArgs: { projectId: projectId },
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
      filters={filters}
      recordType='Household'
      showOptionalColumns
      applyOptionalColumns={(cols) => {
        const result: Partial<GetProjectHouseholdsQueryVariables> = {};

        if (cols.includes(HOUSEHOLD_COLUMNS.assignedStaff.key || ''))
          result.includeStaffAssignment = true;

        return result;
      }}
    />
  );
};
export default ProjectHouseholdsTable;
