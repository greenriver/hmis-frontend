import { useCallback, useMemo } from 'react';
import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useFilters } from '@/modules/hmis/tableFilterUtil';

import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';

import {
  getViewOccupantEnrollmentAction,
  UNIT_COLUMNS,
} from '@/modules/units/columns/unitColumns';
import UnitBulkActions from '@/modules/units/components/UnitBulkActions';
import { useDeleteUnits } from '@/modules/units/hooks/useDeleteUnits';
import { useUnitCeActions } from '@/modules/units/hooks/useUnitCeActions';

import { evictUnitsQuery } from '@/modules/units/util';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  GetUnitsDocument,
  GetUnitsQuery,
  GetUnitsQueryVariables,
  ProjectCoordinatedEntryFeatures,
  UnitTableRowFieldsFragment,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  projectId: string;
  unitGroupId?: string; // if this table is for a specific unit group
  coordinatedEntryFeatures: Partial<ProjectCoordinatedEntryFeatures>;
  noUnitsMessage?: string; // custom message to show when there are no units
}

// Table for managing units within a Project or Unit Group.
//
// - If the user lacks permission to manage units, this will be a read-only table.
// - If the project supports CE referrals, this table will show additional CE-related information and actions,
// such as marking units as available for referrals (a.k.a. creating Opportunities).
const UnitManagementTable: React.FC<Props> = ({
  projectId,
  unitGroupId,
  coordinatedEntryFeatures,
  noUnitsMessage,
}) => {
  const { setUnitToDelete, renderSingleDeleteDialog } = useDeleteUnits({
    onSuccess: () => evictUnitsQuery(projectId, unitGroupId),
  });

  const columns: ColumnDef<UnitTableRowFieldsFragment>[] = useMemo(() => {
    return [
      UNIT_COLUMNS.unitType,
      UNIT_COLUMNS.unitId,
      ...(unitGroupId ? [] : [UNIT_COLUMNS.unitGroup]), // if looking at units in one group, no need to show the unit group col
      UNIT_COLUMNS.unitOccupancyStatus,
      UNIT_COLUMNS.clientOccupants,
      ...(coordinatedEntryFeatures.supportsReferrals
        ? [UNIT_COLUMNS.ceReferralStatus]
        : []),
    ];
  }, [coordinatedEntryFeatures.supportsReferrals, unitGroupId]);

  const filters = useFilters({
    type: 'UnitFilterOptions',
    omit: [
      'status', // deprecated filter option, remove
      ...(unitGroupId ? ['unitType'] : []), // if looking at units in one group, no need to show this filter
    ],
    pickListArgs: { projectId },
  });

  const { project } = useProjectDashboardContext();
  const { canManageUnits, canUpdateUnitAvailability } = project.access;
  const canDoAnyUnitActions =
    canManageUnits ||
    (canUpdateUnitAvailability && coordinatedEntryFeatures.supportsReferrals);

  const { getCeActions, loading } = useUnitCeActions({
    projectId,
    coordinatedEntryFeatures,
    canUpdateUnitAvailability,
  });

  const rowSecondaryActionConfigs = useCallback(
    (unit: UnitTableRowFieldsFragment) => {
      const actions = getCeActions(unit);

      // If unit is occupied, link to hoh Enrollment
      const viewEnrollmentAction = getViewOccupantEnrollmentAction(unit);
      if (viewEnrollmentAction) {
        actions.push(viewEnrollmentAction);
      }

      // Link to Unit Group
      if (!unitGroupId) {
        actions.push({
          title: 'View Unit Group',
          key: 'viewGroup',
          ariaLabel: `'View Unit Group' ${unit.unitGroup?.name}`,
          to: generateSafePath(ProjectDashboardRoutes.UNIT_GROUP, {
            projectId: project.id,
            unitGroupId: unit.unitGroup?.id,
          }),
        });
      }

      // Delete unit
      if (canManageUnits) {
        actions.push({
          title: 'Delete Unit',
          key: 'delete',
          ariaLabel: `Delete Unit ${unit.id}`,
          onClick: () => setUnitToDelete(unit.id),
          disabled: !unit.deletable,
        });
      }

      return actions;
    },
    [getCeActions, unitGroupId, canManageUnits, project.id, setUnitToDelete]
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
          includeCeFields: coordinatedEntryFeatures.supportsReferrals || false,
        }}
        queryDocument={GetUnitsDocument}
        columns={columns}
        pagePath='project.units'
        noData={noUnitsMessage || 'No units'}
        selectable={canDoAnyUnitActions ? 'checkbox' : undefined}
        isRowSelectable={(row) =>
          !!(
            row.deletable ||
            row.canBeMarkedAvailableToday ||
            row.canBeMarkedUnavailable
          )
        }
        defaultFilterValues={{ unitGroup: unitGroupId }}
        filters={filters}
        recordType='Unit'
        EnhancedTableToolbarProps={{
          title: canDoAnyUnitActions ? 'Manage Units' : 'Units',
          renderBulkAction: canDoAnyUnitActions
            ? (_selectedIds, selectedRows) => (
                <UnitBulkActions
                  projectId={projectId}
                  unitGroupId={unitGroupId}
                  units={selectedRows}
                  deletionEnabled={canManageUnits}
                  ceAvailabilityActionsEnabled={
                    coordinatedEntryFeatures.supportsReferrals &&
                    canUpdateUnitAvailability
                  }
                />
              )
            : undefined,
        }}
        rowName={(row) => `${row.unitType?.description} - ${row.id}`}
        rowSecondaryActionConfigs={rowSecondaryActionConfigs}
        loading={loading}
        loadingVariant='linear'
      />
      {renderSingleDeleteDialog()}
    </>
  );
};
export default UnitManagementTable;
