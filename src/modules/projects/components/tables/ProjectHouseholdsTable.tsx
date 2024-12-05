import {
  Box,
  Chip,
  Stack,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import React, { ReactNode, useMemo } from 'react';
import TableRowActions from '@/components/elements/table/TableRowActions';
import { ColumnDef } from '@/components/elements/table/types';
import ClientName from '@/modules/client/components/ClientName';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import EnrollmentClientNameWithAge from '@/modules/hmis/components/EnrollmentClientNameWithAge';
import EnrollmentDateRangeWithStatus from '@/modules/hmis/components/EnrollmentDateRangeWithStatus';
import EnrollmentStatus from '@/modules/hmis/components/EnrollmentStatus';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import HohIndicator from '@/modules/hmis/components/HohIndicator';
import { useFilters } from '@/modules/hmis/filterUtil';
import {
  clientBriefName,
  formatDateForDisplay,
  formatDateForGql,
  hohSort,
  parseAndFormatDate,
} from '@/modules/hmis/hmisUtil';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import {
  ClientDashboardRoutes,
  EnrollmentDashboardRoutes,
} from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  GetProjectHouseholdsDocument,
  GetProjectHouseholdsQuery,
  GetProjectHouseholdsQueryVariables,
  HouseholdFilterOptions,
  HouseholdWithStaffAssignmentsFragment,
  ProjectEnrollmentsHouseholdClientFieldsFragment,
  ProjectEnrollmentsHouseholdFieldsFragment,
  RelationshipToHoH,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

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
  key: 'assigned_staff',
  render: (hh: HouseholdWithStaffAssignmentsFragment) => {
    if (!hh.staffAssignments?.nodes.length) return;

    const first = hh.staffAssignments.nodes[0].user.name;
    const rest = hh.staffAssignments.nodes
      .slice(1)
      .map((staffAssignment) => staffAssignment.user.name);

    return (
      <>
        {first}{' '}
        {rest.length > 0 && (
          <Tooltip arrow title={rest.join(', ')}>
            <Chip
              sx={{ mb: 0.5 }}
              size='small'
              label={`+${rest.length} more`}
            />
          </Tooltip>
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

const tableRowActions = [
  {
    title: 'View Enrollment',
    key: 'enrollment',
    getUrl: (
      householdClient: ProjectEnrollmentsHouseholdClientFieldsFragment
    ) =>
      generateSafePath(EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW, {
        clientId: householdClient.client.id,
        enrollmentId: householdClient.enrollment.id,
      }),
  },
  {
    title: 'View Client',
    key: 'client',
    getUrl: (
      householdClient: ProjectEnrollmentsHouseholdClientFieldsFragment
    ) =>
      generateSafePath(ClientDashboardRoutes.PROFILE, {
        clientId: householdClient.client.id,
      }),
  },
];

interface ProjectHouseholdsClientRowProps {
  household: ProjectEnrollmentsHouseholdFieldsFragment;
  householdClient: ProjectEnrollmentsHouseholdClientFieldsFragment;
  lastInGroup?: boolean;
  showAssignedStaff?: boolean;
}
// TODO(#6761) it could be nice to keep these in render functions and refer to those
const ProjectHouseholdsClientRow: React.FC<ProjectHouseholdsClientRowProps> = ({
  household,
  householdClient,
  lastInGroup = false,
  showAssignedStaff = false,
}) => {
  const cellSx = useMemo(
    () => (lastInGroup ? { borderBottom: 0, py: 0.5 } : { py: 0.5 }),
    [lastInGroup]
  );

  return (
    <TableRow key={household.id + householdClient.id}>
      <TableCell role='rowheader' sx={cellSx}>
        <ClientName client={householdClient.client} />
      </TableCell>
      <TableCell sx={cellSx}>{householdClient.client.age}</TableCell>
      <TableCell sx={cellSx}>
        <HmisEnum
          key={householdClient.id}
          value={householdClient.relationshipToHoH}
          enumMap={HmisEnums.RelationshipToHoH}
          whiteSpace='nowrap'
        />
      </TableCell>
      <TableCell sx={cellSx}>
        {parseAndFormatDate(householdClient.enrollment.entryDate)}
      </TableCell>
      <TableCell sx={cellSx}>
        {parseAndFormatDate(householdClient.enrollment.exitDate)}
      </TableCell>
      <TableCell sx={cellSx}>
        <EnrollmentStatus
          key={householdClient.id}
          enrollment={householdClient.enrollment}
        />
      </TableCell>
      {showAssignedStaff && (
        <TableCell sx={cellSx}>
          {ASSIGNED_STAFF_COL.render(household)}
        </TableCell>
      )}
      <TableCell sx={cellSx}>
        <TableRowActions
          record={householdClient}
          recordName={clientBriefName(householdClient.client)}
          actions={tableRowActions}
        />
      </TableCell>
    </TableRow>
  );
};

const CustomDividerRow = ({ colSpan }: { colSpan: number }) => (
  <TableRow sx={{ height: '8px' }}>
    <TableCell
      colSpan={colSpan}
      sx={(theme) => {
        return {
          padding: 0,
          // TODO - remove after confirming on PR
          // note: color specified in designs ('#f9f9f9') is slightly lighter than grey[200] ('#eeeeee') and slightly darker than grey[100] ('#f5f5f5')
          backgroundColor: theme.palette.grey[100],
          borderTop: `1px solid ${theme.palette.borders.main}`,
          borderBottom: `1px solid ${theme.palette.borders.main}`,
        };
      }}
    />
  </TableRow>
);

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

  const defaultColumns: ColumnDef<HouseholdFields>[] = useMemo(
    () => [
      // These column defs get empty render functions because we use renderRow to show each household member as an individual row.
      { header: 'Client Name', render: () => '' },
      { header: 'Age', render: () => '' },
      { header: 'Relationship', render: () => '' },
      { header: 'Entry Date', render: () => '' },
      { header: 'Exit Date', render: () => '' },
      { header: 'Status', render: () => '' },
      ...(staffAssignmentsEnabled
        ? [{ ...ASSIGNED_STAFF_COL, render: () => '' }]
        : []),
      {
        key: 'actions',
        header: <Box sx={visuallyHidden}>Actions</Box>,
        render: () => '',
      },
    ],
    [staffAssignmentsEnabled]
  );

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
      overrideTableBody={true}
      renderRow={(household, columnKeys) => {
        return (
          <>
            <TableBody
              // TODO @martha - discuss these TableBodies to achieve the `rowgroup` role, is it worth it?
              role='rowgroup'
            >
              <CustomDividerRow colSpan={(columns || defaultColumns).length} />
              {[...household.householdClients]
                .sort(hohSort)
                .map((householdClient, index) => (
                  <ProjectHouseholdsClientRow
                    household={household}
                    householdClient={householdClient}
                    lastInGroup={
                      index === household.householdClients.length - 1
                    }
                    showAssignedStaff={columnKeys.includes(
                      HOUSEHOLD_COLUMNS.assignedStaff.key || ''
                    )}
                  />
                ))}
            </TableBody>
          </>
        );
      }}
      injectBelowRows={
        <CustomDividerRow colSpan={(columns || defaultColumns).length} />
      }
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
