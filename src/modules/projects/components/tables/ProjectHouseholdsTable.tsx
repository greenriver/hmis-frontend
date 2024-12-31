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
import { renderCellContents } from '@/components/elements/table/GenericTable';
import {
  getViewClientAction,
  getViewEnrollmentAction,
} from '@/components/elements/table/tableActions/tableRowActionUtil';
import TableRowActions from '@/components/elements/table/TableRowActions';
import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { useFilters } from '@/modules/hmis/filterUtil';
import {
  clientBriefName,
  formatDateForDisplay,
  formatDateForGql,
  hohSort,
} from '@/modules/hmis/hmisUtil';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { WITH_ENROLLMENT_COLUMNS } from '@/modules/projects/components/tables/ProjectClientEnrollmentsTable';
import { CLIENT_COLUMNS } from '@/modules/search/components/ClientSearch';
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

    const allNames = hh.staffAssignments.nodes.map(
      (staffAssignment) => staffAssignment.user.name
    );

    const first = allNames[0];
    const rest = allNames.slice(1);

    return (
      <Box aria-label={allNames.join(', ')}>
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
      </Box>
    );
  },
};

type OneHouseholdClient = HouseholdFields['householdClients'][number];
const BASE_COLUMNS: ColumnDef<OneHouseholdClient>[] = [
  CLIENT_COLUMNS.name,
  CLIENT_COLUMNS.age,
  {
    header: 'Relationship',
    render: (householdClient) => (
      <HmisEnum
        key={householdClient.id}
        value={householdClient.relationshipToHoH}
        enumMap={HmisEnums.RelationshipToHoH}
        whiteSpace='nowrap'
      />
    ),
  },
  WITH_ENROLLMENT_COLUMNS.entryDate,
  WITH_ENROLLMENT_COLUMNS.exitDate,
  WITH_ENROLLMENT_COLUMNS.enrollmentStatus,
];
const ACTION_COL: ColumnDef<OneHouseholdClient> = {
  key: 'actions',
  header: <Box sx={visuallyHidden}>Actions</Box>,
  render: (householdClient) => (
    <TableRowActions
      record={householdClient}
      recordName={clientBriefName(householdClient.client)}
      primaryActionConfig={getViewEnrollmentAction(
        householdClient.enrollment,
        householdClient.client
      )}
      secondaryActionConfigs={[getViewClientAction(householdClient.client)]}
    />
  ),
};

interface ProjectHouseholdsClientRowProps {
  household: ProjectEnrollmentsHouseholdFieldsFragment;
  householdClient: ProjectEnrollmentsHouseholdClientFieldsFragment;
  lastInGroup?: boolean;
  showAssignedStaff?: boolean;
}

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
      {BASE_COLUMNS.map((col, i) => (
        <TableCell role={i === 0 ? 'rowheader' : undefined} sx={cellSx}>
          {renderCellContents(householdClient, col.render)}
        </TableCell>
      ))}
      {showAssignedStaff && (
        <TableCell sx={cellSx}>
          {renderCellContents(household, ASSIGNED_STAFF_COL.render)}
        </TableCell>
      )}
      <TableCell sx={cellSx}>
        {renderCellContents(householdClient, ACTION_COL.render)}
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

  // dummy column defs for Household that are only used for the headers, not for rendering cells
  const defaultColumns: ColumnDef<HouseholdFields>[] = useMemo(() => {
    return [
      ...BASE_COLUMNS,
      ...(staffAssignmentsEnabled ? [ASSIGNED_STAFF_COL] : []),
      ACTION_COL,
    ].map(({ header, key, optional, defaultHidden }) => ({
      header,
      key,
      optional,
      defaultHidden,
      render: () => null,
    }));
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
