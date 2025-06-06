import { useCallback, useMemo } from 'react';
import UnitBulkActions from './UnitBulkActions';
import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useFilters } from '@/modules/hmis/filterUtil';
import { useHasRootPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { UNIT_COLUMNS } from '@/modules/units/components/ProjectUnitsTable';
import { useDeleteUnits } from '@/modules/units/hooks/useDeleteUnits';
import { useUnitCeActions } from '@/modules/units/hooks/useUnitCeActions';
import { useUnitCeColumns } from '@/modules/units/hooks/useUnitCeColumns';
import { evictUnitsQuery } from '@/modules/units/util';
import {
  GetUnitsDocument,
  GetUnitsQuery,
  GetUnitsQueryVariables,
  UnitTableRowFieldsFragment,
} from '@/types/gqlTypes';

interface Props {
  projectId: string;
  unitGroupId: string;
  canAcceptReferrals: boolean;
}

const UnitManagementTable: React.FC<Props> = ({
  projectId,
  unitGroupId,
  canAcceptReferrals,
}) => {
  const { setUnitToDelete, renderSingleDeleteDialog } = useDeleteUnits({
    onSuccess: () => evictUnitsQuery(projectId, unitGroupId),
  });

  // TODO(7409) - instead of using the global permission, check project-level config
  const [canViewCoordinatedEntry] = useHasRootPermissions([
    'canViewCoordinatedEntry',
  ]);

  const ceColumns = useUnitCeColumns();
  const columns: ColumnDef<UnitTableRowFieldsFragment>[] = useMemo(() => {
    return [
      UNIT_COLUMNS.unitType,
      UNIT_COLUMNS.unitId,
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
  const canEdit = project.access.canManageUnits;

  const { getCeActions, loading } = useUnitCeActions({ project });

  const rowSecondaryActionConfigs = useCallback(
    (unit: UnitTableRowFieldsFragment) => {
      return [
        ...getCeActions(unit),
        ...(canEdit
          ? [
              {
                title: 'Delete Unit',
                key: 'delete',
                ariaLabel: `Delete Unit ${unit.id}`,
                onClick: () => setUnitToDelete(unit.id),
                disabled: !unit.deletable,
                // disabledReason: 'Currently assigned units cannot be deleted',
              },
            ]
          : []),
      ];
    },
    [canEdit, getCeActions, setUnitToDelete]
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
        selectable={canEdit ? 'checkbox' : undefined}
        isRowSelectable={(row) =>
          row.deletable ||
          row.canBeMarkedAvailableToday ||
          row.canBeMarkedUnavailable
        }
        defaultFilterValues={{ unitGroup: unitGroupId }}
        filters={filters}
        recordType='Unit'
        EnhancedTableToolbarProps={{
          title: 'Manage Units',
          renderBulkAction: canEdit
            ? (_selectedIds, selectedRows) => (
                <UnitBulkActions
                  projectId={projectId}
                  unitGroupId={unitGroupId}
                  units={selectedRows}
                  canAcceptReferrals={canAcceptReferrals}
                />
              )
            : undefined,
        }}
        rowName={(row) => `${row.unitType?.description} - ${row.id}`}
        rowSecondaryActionConfigs={rowSecondaryActionConfigs}
        loading={loading}
        loadingVariant='linear'
        // Only link to Unit page if CE is enabled. For now we don't have anything non-CE to show.
        // rowLinkTo={
        //   canViewCoordinatedEntry
        //     ? (row) =>
        //         generateSafePath(ProjectDashboardRoutes.UNIT, {
        //           projectId,
        //           unitId: row.id,
        //         })
        //     : undefined
        // }
      />
      {renderSingleDeleteDialog()}
    </>
  );
};
export default UnitManagementTable;
