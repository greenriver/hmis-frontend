import {
  Box,
  Chip,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import React, { useMemo } from 'react';
import TableRowActions from '@/components/elements/table/TableRowActions';
import { ColumnDef } from '@/components/elements/table/types';
import ClientName from '@/modules/client/components/ClientName';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import EnrollmentStatus from '@/modules/hmis/components/EnrollmentStatus';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
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
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

export type HouseholdFields = NonNullable<
  GetProjectHouseholdsQuery['project']
>['households']['nodes'][number];

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
          primaryActionConfig={{
            title: 'View Enrollment',
            key: 'enrollment',
            ariaLabel: `View Enrollment, ${clientBriefName(householdClient.client)}`,
            to: generateSafePath(
              EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW,
              {
                clientId: householdClient.client.id,
                enrollmentId: householdClient.enrollment.id,
              }
            ),
          }}
          secondaryActionConfigs={[
            {
              title: 'View Client',
              key: 'client',
              ariaLabel: `View Client, ${clientBriefName(householdClient.client)}`,
              to: generateSafePath(ClientDashboardRoutes.PROFILE, {
                clientId: householdClient.client.id,
              }),
            },
          ]}
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
      TableBodyComponent={React.Fragment}
      renderRow={(household, columnKeys) => {
        return (
          <TableBody
            // Render each household as its own `tbody` in order to use the role='rowgroup' for better accessibility markup
            key={household.id}
            role='rowgroup'
          >
            <CustomDividerRow colSpan={(columns || defaultColumns).length} />
            {[...household.householdClients]
              .sort(hohSort)
              .map((householdClient, index) => (
                <ProjectHouseholdsClientRow
                  key={householdClient.id}
                  household={household}
                  householdClient={householdClient}
                  lastInGroup={index === household.householdClients.length - 1}
                  showAssignedStaff={columnKeys.includes(
                    ASSIGNED_STAFF_COL.key || ''
                  )}
                />
              ))}
          </TableBody>
        );
      }}
      injectBelowRows={
        <TableBody>
          <CustomDividerRow colSpan={(columns || defaultColumns).length} />
        </TableBody>
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

        if (cols.includes(ASSIGNED_STAFF_COL.key || ''))
          result.includeStaffAssignment = true;

        return result;
      }}
    />
  );
};
export default ProjectHouseholdsTable;
