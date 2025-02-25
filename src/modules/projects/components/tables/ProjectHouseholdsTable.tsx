import { TableBody, TableCell, TableRow } from '@mui/material';
import React, { useCallback, useMemo } from 'react';
import {
  clickableRowStyles,
  getStickyCellStyles,
  renderCellContents,
  renderLinkedRowCellContents,
  stickyCellClassName,
} from '@/components/elements/table/GenericTable';
import TableRowActions from '@/components/elements/table/TableRowActions';
import {
  BASE_ACTION_COLUMN_DEF,
  getViewClientMenuItem,
  getViewEnrollmentMenuItem,
} from '@/components/elements/table/tableRowActionUtil';
import { ColumnDef } from '@/components/elements/table/types';
import { getColumnKey } from '@/components/elements/table/util';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { useFilters } from '@/modules/hmis/filterUtil';
import {
  clientBriefName,
  PERMANENT_HOUSING_PROJECT_TYPES,
  sortHouseholdMembers,
} from '@/modules/hmis/hmisUtil';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import {
  HOUSEHOLD_ASSIGNED_STAFF_COL,
  ProjectEnrollmentFields,
  WITH_ENROLLMENT_COLUMNS,
  WITH_ENROLLMENT_OPTIONAL_COLUMNS,
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

export const ENROLLMENT_RELATIONSHIP_COL = {
  header: 'Relationship',
  key: 'relationship',
  render: (e: Pick<ProjectEnrollmentFields, 'id' | 'relationshipToHoH'>) => (
    <HmisEnum
      key={e.id}
      value={e.relationshipToHoH}
      enumMap={{
        ...HmisEnums.RelationshipToHoH,
        // Display "HoH", instead of "Self (HoH)"
        SELF_HEAD_OF_HOUSEHOLD: 'HoH',
      }}
      whiteSpace='nowrap'
    />
  ),
};

type OneHouseholdClient = HouseholdFields['householdClients'][number];
const BASE_COLUMNS: ColumnDef<OneHouseholdClient>[] = [
  { ...CLIENT_COLUMNS.name, sticky: 'left' },
  CLIENT_COLUMNS.age,
  ENROLLMENT_RELATIONSHIP_COL,
  WITH_ENROLLMENT_COLUMNS.entryDate,
  WITH_ENROLLMENT_COLUMNS.exitDate,
  WITH_ENROLLMENT_COLUMNS.enrollmentStatus,
  WITH_ENROLLMENT_OPTIONAL_COLUMNS.lastContactDate,
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
  columnKeys: string[];
  lastInGroup?: boolean;
}

const ProjectHouseholdsClientRow: React.FC<ProjectHouseholdsClientRowProps> = ({
  household,
  householdClient,
  columnKeys,
  lastInGroup = false,
}) => {
  const cellSx = useCallback(
    (col?: ColumnDef<ProjectEnrollmentsHouseholdClientFieldsFragment>) => {
      const cellProps = col?.tableCellProps;
      const cellSx = typeof cellProps === 'object' ? cellProps.sx : {};

      return {
        p: 0,
        ...(lastInGroup ? { borderBottom: 0 } : {}),
        ...getStickyCellStyles({ sticky: col?.sticky }),
        ...cellSx,
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
      {BASE_COLUMNS.filter((col) => columnKeys.includes(getColumnKey(col))).map(
        (col, i) => (
          <TableCell
            key={getColumnKey(col) || i}
            role={i === 0 ? 'rowheader' : undefined}
            sx={cellSx(col)}
            className={col?.sticky ? stickyCellClassName : undefined}
          >
            {renderLinkedRowCellContents({
              rowLink,
              row: householdClient,
              render: col.render,
            })}
          </TableCell>
        )
      )}
      {columnKeys.includes(
        getColumnKey(WITH_ENROLLMENT_OPTIONAL_COLUMNS.moveInDate)
      ) && (
        <TableCell sx={cellSx()}>
          {renderLinkedRowCellContents({
            rowLink,
            row: householdClient,
            render: WITH_ENROLLMENT_OPTIONAL_COLUMNS.moveInDate.render,
          })}
        </TableCell>
      )}
      {columnKeys.includes(getColumnKey(HOUSEHOLD_ASSIGNED_STAFF_COL)) && (
        <TableCell sx={cellSx()}>
          {renderLinkedRowCellContents({
            rowLink,
            row: household,
            render: HOUSEHOLD_ASSIGNED_STAFF_COL.render,
          })}
        </TableCell>
      )}
      <TableCell sx={cellSx(ACTION_COL)} className={stickyCellClassName}>
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
          backgroundColor: theme.palette.grey[200],
          borderTop: `1px solid ${theme.palette.borders.main}`,
          borderBottom: `1px solid ${theme.palette.borders.main}`,
        };
      }}
    />
  </TableRow>
);

interface Props {
  projectId: string;
  searchTerm?: string;
}

const ProjectHouseholdsTable: React.FC<Props> = ({ projectId, searchTerm }) => {
  const {
    project: { staffAssignmentsEnabled, projectType },
  } = useProjectDashboardContext();

  // dummy column defs for Household that are only used for the headers, not for rendering cells
  const columns: ColumnDef<HouseholdFields>[] = useMemo(() => {
    return [
      ...BASE_COLUMNS,
      ...(projectType && PERMANENT_HOUSING_PROJECT_TYPES.includes(projectType)
        ? [WITH_ENROLLMENT_OPTIONAL_COLUMNS.moveInDate]
        : []),
      ...(staffAssignmentsEnabled ? [HOUSEHOLD_ASSIGNED_STAFF_COL] : []),
      ACTION_COL,
    ].map(({ render, ...rest }) => ({
      ...rest,
      render: () => null,
      tableCellProps: undefined, // typescript appeasement
    }));
  }, [projectType, staffAssignmentsEnabled]);

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
        // filter from parent component gets merged with any filters selected on the table
        filters: { searchTerm },
      }}
      queryDocument={GetProjectHouseholdsDocument}
      columns={columns}
      TableBodyComponent={React.Fragment}
      renderRow={(household, columnKeys) => {
        return (
          <TableBody
            // Render each household as its own `tbody` in order to use the role='rowgroup' for better accessibility markup
            key={household.id}
            role='rowgroup'
          >
            <CustomDividerRow colSpan={columns.length} />
            {sortHouseholdMembers(household.householdClients).map(
              (householdClient, index) => (
                <ProjectHouseholdsClientRow
                  key={householdClient.id}
                  household={household}
                  householdClient={householdClient}
                  lastInGroup={index === household.householdClients.length - 1}
                  columnKeys={columnKeys}
                />
              )
            )}
          </TableBody>
        );
      }}
      belowRowsContent={
        <TableBody>
          <CustomDividerRow colSpan={columns.length} />
        </TableBody>
      }
      noData='No households'
      pagePath='project.households'
      filters={filters}
      recordType='Household'
      showOptionalColumns
    />
  );
};
export default ProjectHouseholdsTable;
