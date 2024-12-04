import {
  Chip,
  Stack,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
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
// todo @martha (#6761) it could be nice to keep these in render functions and refer to those,
// for consistency, but that requires some more typescript shenanigans that I haven't cracked yet
const ProjectHouseholdsClientRow: React.FC<ProjectHouseholdsClientRowProps> = ({
  household,
  householdClient,
  lastInGroup = false,
  showAssignedStaff = false,
}) => {
  const cellSx = useMemo(
    () => (lastInGroup ? { borderBottom: 0 } : {}),
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
          {/* todo @martha - discuss - we don't want this spanning multi rows (bc bad for a11y),
                     but is it more clear to have it only applied to the HoH or repeat per row? */}
          {householdClient.relationshipToHoH ===
            RelationshipToHoH.SelfHeadOfHousehold &&
            ASSIGNED_STAFF_COL.render(household)}
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
      { key: 'actions', header: '', render: () => '' },
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
              sx={(theme) => {
                return {
                  // borderTop: `8px solid ${theme.palette.borders.light}`,
                  // TODO @martha discuss - the below sx was generated by chat gpt
                  // based on https://css-tricks.com/snippets/css/multiple-borders/
                  // A simpler approach would be single borderTop, above, but it differs from the designs.
                  // The reason for the complication (why can't we just insert a div?)
                  // arises from MUI's Table structure.
                  position: 'relative', // Needed for proper pseudo-element positioning
                  '&::before': {
                    content: '""', // Necessary for the pseudo-element to render
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '10px', // Total height of the triple border (1 + 8 + 1)
                    // note: theme.palette.grey[200] ('#eeeeee') is slightly lighter than specified in designs ('#f9f9f9')
                    background: `linear-gradient(to bottom, ${theme.palette.borders.main} 1px, ${theme.palette.grey[200]} 1px, ${theme.palette.grey[200]} 9px, ${theme.palette.borders.main} 9px)`, // Triple border effect
                  },
                  // TODO @martha - this doesn't quite work; pursue further if we are going with this option
                  // TODO @martha - if we are going with this option, will need to add a bottom border to the last element in the table
                  paddingTop: '10px', // To ensure content doesn't overlap with the pseudo-element
                };
              }}
              // TODO @martha - discuss these TableBodies to achieve the `rowgroup` role, is it worth it?
              role='rowgroup'
            >
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
