import { useCallback, useMemo } from 'react';
import UnitOccupants from './UnitOccupants';
import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { DataColumnDef } from '@/modules/dataFetching/types';
import { useFilters } from '@/modules/hmis/filterUtil';
import { useHasRootPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { useUnitCeColumns } from '@/modules/units/hooks/useUnitCeColumns';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  GetUnitsDocument,
  GetUnitsQuery,
  GetUnitsQueryVariables,
  UnitOccupancyStatus,
  UnitTableRowFieldsFragment,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

export const UNIT_COLUMNS: Record<
  string,
  DataColumnDef<UnitTableRowFieldsFragment, GetUnitsQueryVariables>
> = {
  unitType: {
    header: 'Unit Type',
    key: 'unitType',
    render: (unit: UnitTableRowFieldsFragment) => unit.unitType?.description,
    sticky: 'left',
  },
  unitId: {
    header: 'Unit ID',
    key: 'unitId',
    render: 'id',
  },
  unitGroup: {
    header: 'Unit Group',
    key: 'unitGroup',
    render: (unit: UnitTableRowFieldsFragment) => unit.unitGroup?.name || 'N/A',
  },
  unitOccupancyStatus: {
    header: 'Occupancy',
    key: 'occupancy',
    render: (unit: UnitTableRowFieldsFragment) =>
      unit.occupancyStatus === UnitOccupancyStatus.Occupied
        ? 'Occupied'
        : 'Vacant',
  },
  clientOccupants: {
    header: 'Client Occupants',
    key: 'clients',
    render: (unit: UnitTableRowFieldsFragment) => <UnitOccupants unit={unit} />,
    optional: {
      defaultHidden: true,
      queryVariableField:
        'includeClientOccupants' as keyof GetUnitsQueryVariables,
    },
  },
};
const ProjectUnitsTable = ({ projectId }: { projectId: string }) => {
  // TODO(7409) - instead of using the global permission, check project-level config
  const [canViewCoordinatedEntry] = useHasRootPermissions([
    'canViewCoordinatedEntry',
  ]);

  const ceColumns = useUnitCeColumns();
  const columns: ColumnDef<UnitTableRowFieldsFragment>[] = useMemo(() => {
    return [
      UNIT_COLUMNS.unitType,
      UNIT_COLUMNS.unitId,
      UNIT_COLUMNS.unitGroup,
      UNIT_COLUMNS.unitOccupancyStatus,
      UNIT_COLUMNS.clientOccupants,
      ...ceColumns,
    ];
  }, [ceColumns]);

  const filters = useFilters({
    type: 'UnitFilterOptions',
    omit: ['status'], // deprecated filter option, remove
  });

  const { project } = useProjectDashboardContext();

  const rowSecondaryActionConfigs = useCallback(
    (unit: UnitTableRowFieldsFragment) => {
      if (!unit.unitGroup) return [];

      const label = project.access.canManageUnits
        ? 'Manage Unit Group'
        : 'View Unit Group';
      return [
        {
          title: label,
          key: 'viewGroup',
          ariaLabel: `${label} ${unit.unitGroup.name}`,
          to: generateSafePath(ProjectDashboardRoutes.UNIT_GROUP, {
            projectId: project.id,
            unitGroupId: unit.unitGroup.id,
          }),
        },
      ];
    },
    [project.access.canManageUnits, project.id]
  );

  const rowLinkToUnit = useCallback(
    (row: UnitTableRowFieldsFragment) => {
      return generateSafePath(ProjectDashboardRoutes.UNIT, {
        projectId,
        unitId: row.id,
      });
    },
    [projectId]
  );
  return (
    <>
      <GenericTableWithData<
        GetUnitsQuery,
        GetUnitsQueryVariables,
        UnitTableRowFieldsFragment
      >
        defaultPageSize={25}
        queryVariables={{
          id: projectId,
          includeCeFields: canViewCoordinatedEntry,
        }}
        queryDocument={GetUnitsDocument}
        columns={columns}
        pagePath='project.units'
        noData='No units'
        isRowSelectable={(row) =>
          row.occupancyStatus === UnitOccupancyStatus.Vacant
        }
        filters={filters}
        recordType='Unit'
        rowName={(row) => `${row.unitType?.description} - ${row.id}`}
        rowSecondaryActionConfigs={rowSecondaryActionConfigs}
        loadingVariant='linear'
        // Only link to Unit page if CE is enabled. For now we don't have anything non-CE to show.
        rowLinkTo={canViewCoordinatedEntry ? rowLinkToUnit : undefined}
        rowActionTitle={canViewCoordinatedEntry ? 'View Unit' : undefined}
      />
    </>
  );
};
export default ProjectUnitsTable;
