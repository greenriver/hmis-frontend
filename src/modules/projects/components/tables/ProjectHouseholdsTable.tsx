import { TableBody, TableCell, TableRow } from '@mui/material';
import React, { useCallback, useMemo } from 'react';
import {
  clickableRowStyles,
  getColumnKey,
  getStickyCellStyles,
  renderCellContents,
  renderLinkedRowCellContents,
} from '@/components/elements/table/GenericTable';
import TableRowActions from '@/components/elements/table/TableRowActions';
import {
  BASE_ACTION_COLUMN_DEF,
  getViewClientMenuItem,
  getViewEnrollmentMenuItem,
} from '@/components/elements/table/tableRowActionUtil';
import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { useFilters } from '@/modules/hmis/filterUtil';
import {
  clientBriefName,
  formatDateForDisplay,
  formatDateForGql,
  sortHouseholdMembers,
} from '@/modules/hmis/hmisUtil';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import {
  ASSIGNED_STAFF_COL,
  WITH_ENROLLMENT_COLUMNS,
} from '@/modules/projects/components/tables/ProjectClientEnrollmentsTable';
import { CLIENT_COLUMNS } from '@/modules/search/components/ClientSearch';
import { HmisEnums } from '@/types/gqlEnums';
import {
  GetProjectHouseholdsDocument,
  GetProjectHouseholdsQuery,
  GetProjectHouseholdsQueryVariables,
  HouseholdFilterOptions,
  ProjectEnrollmentsHouseholdClientFieldsFragment,
  ProjectEnrollmentsHouseholdFieldsFragment,
} from '@/types/gqlTypes';

export type HouseholdFields = NonNullable<
  GetProjectHouseholdsQuery['project']
>['households']['nodes'][number];

type OneHouseholdClient = HouseholdFields['householdClients'][number];
const BASE_COLUMNS: ColumnDef<OneHouseholdClient>[] = [
  { ...CLIENT_COLUMNS.name, sticky: 'left' },
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
  ...BASE_ACTION_COLUMN_DEF,
  render: (householdClient) => (
    <TableRowActions
      record={householdClient}
      recordName={clientBriefName(householdClient.client)}
      menuActionConfigs={[
        getViewEnrollmentMenuItem(
          householdClient.enrollment,
          householdClient.client
        ),
        getViewClientMenuItem(householdClient.client),
      ]}
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
  const cellSx = useCallback(
    (col?: ColumnDef<ProjectEnrollmentsHouseholdClientFieldsFragment>) => {
      return {
        py: 0.5,
        ...(lastInGroup ? { borderBottom: 0 } : {}),
        ...getStickyCellStyles({ sticky: col?.sticky }),
      };
    },
    [lastInGroup]
  );

  const rowLink = getViewEnrollmentMenuItem(
    householdClient.enrollment,
    householdClient.client
  ).to;

  return (
    <TableRow sx={clickableRowStyles} key={household.id + householdClient.id}>
      {BASE_COLUMNS.map((col, i) => (
        <TableCell
          key={getColumnKey(col) || i}
          role={i === 0 ? 'rowheader' : undefined}
          sx={cellSx(col)}
        >
          {renderLinkedRowCellContents(rowLink, householdClient, col.render, i)}
        </TableCell>
      ))}
      {showAssignedStaff && (
        <TableCell sx={cellSx()}>
          {renderLinkedRowCellContents(
            rowLink,
            household,
            ASSIGNED_STAFF_COL.render,
            -1
          )}
        </TableCell>
      )}
      <TableCell sx={cellSx(ACTION_COL)}>
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
      ...(staffAssignmentsEnabled ? [{ ...ASSIGNED_STAFF_COL }] : []), // typescript appeasement
      ACTION_COL,
    ].map(({ render, ...rest }) => ({
      ...rest,
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
            {sortHouseholdMembers(household.householdClients).map(
              (householdClient, index) => (
                <ProjectHouseholdsClientRow
                  key={householdClient.id}
                  household={household}
                  householdClient={householdClient}
                  lastInGroup={index === household.householdClients.length - 1}
                  showAssignedStaff={columnKeys.includes(
                    ASSIGNED_STAFF_COL.key || ''
                  )}
                />
              )
            )}
          </TableBody>
        );
      }}
      belowRowsContent={
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
