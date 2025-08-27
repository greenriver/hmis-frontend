import { useCallback, useMemo } from 'react';
import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useFilters } from '@/modules/hmis/filterUtil';

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
  UnitTableRowFieldsFragment,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  projectId: string;
  unitGroupId?: string; // if this table is for a specific unit group
  unitGroupsEnabled?: boolean; // TEMP(#7814), remove when all projects moved to unit groups
  projectSupportsReferrals?: boolean; // whether to show CE details
}

// Table for managing units within a Project or Unit Group.
//
// - If the user lacks permission to manage units, this will be a read-only table.
// - If the project supports CE referrals, this table will show additional CE-related information and actions,
// such as marking units as available for referrals (a.k.a. creating Opportunities).
const UnitManagementTable: React.FC<Props> = ({
  projectId,
  unitGroupId,
  unitGroupsEnabled = false,
  projectSupportsReferrals = false,
}) => {
  const { setUnitToDelete, renderSingleDeleteDialog } = useDeleteUnits({
    onSuccess: () => evictUnitsQuery(projectId, unitGroupId),
  });

  const columns: ColumnDef<UnitTableRowFieldsFragment>[] = useMemo(() => {
    return [
      UNIT_COLUMNS.unitType,
      UNIT_COLUMNS.unitId,
      ...(unitGroupsEnabled ? [UNIT_COLUMNS.unitGroup] : []),
      UNIT_COLUMNS.unitOccupancyStatus,
      UNIT_COLUMNS.clientOccupants,
      ...(projectSupportsReferrals ? [UNIT_COLUMNS.ceReferralStatus] : []),
    ];
  }, [projectSupportsReferrals, unitGroupsEnabled]);

  const filters = useFilters({
    type: 'UnitFilterOptions',
    omit: [
      'status', // deprecated filter option, remove
      ...(unitGroupId ? ['unitType'] : []), // if looking at units in one group, no need to show this filter
    ],
    pickListArgs: { projectId },
  });

  const { project } = useProjectDashboardContext();
  const canManageUnits = project.access.canManageUnits;

  const { getCeActions, loading } = useUnitCeActions({
    projectId,
    projectSupportsReferrals,
  });

  const rowSecondaryActionConfigs = useCallback(
    (unit: UnitTableRowFieldsFragment) => {
      const actions = [];
      if (projectSupportsReferrals) {
        actions.push(...getCeActions(unit));
      }
      // If unit is occupied, link to hoh Enrollment
      const viewEnrollmentAction = getViewOccupantEnrollmentAction(unit);
      if (viewEnrollmentAction) {
        actions.push(viewEnrollmentAction);
      }

      // Link to Unit Group
      if (!unitGroupId && unitGroupsEnabled && unit.unitGroup) {
        actions.push({
          title: 'View Unit Group',
          key: 'viewGroup',
          ariaLabel: `'View Unit Group' ${unit.unitGroup.name}`,
          to: generateSafePath(ProjectDashboardRoutes.UNIT_GROUP, {
            projectId: project.id,
            unitGroupId: unit.unitGroup.id,
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
    [
      projectSupportsReferrals,
      unitGroupId,
      unitGroupsEnabled,
      canManageUnits,
      getCeActions,
      project.id,
      setUnitToDelete,
    ]
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
          includeCeFields: projectSupportsReferrals,
        }}
        queryDocument={GetUnitsDocument}
        columns={columns}
        pagePath='project.units'
        noData='No units'
        selectable={canManageUnits ? 'checkbox' : undefined}
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
          title: canManageUnits ? 'Manage Units' : 'Units',
          renderBulkAction: canManageUnits
            ? (_selectedIds, selectedRows) => (
                <UnitBulkActions
                  projectId={projectId}
                  unitGroupId={unitGroupId}
                  units={selectedRows}
                  ceAvailabilityActionsEnabled={projectSupportsReferrals}
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
