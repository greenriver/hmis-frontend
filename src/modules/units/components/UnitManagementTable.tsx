import { useCallback, useMemo } from 'react';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useFilters } from '@/modules/hmis/filterUtil';

import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';

import {
  getViewOccupantEnrollmentAction,
  UNIT_COLUMNS,
} from '@/modules/units/columns/unitColumns';
import { useDeleteUnits } from '@/modules/units/hooks/useDeleteUnits';
import { useUnitCeActions } from '@/modules/units/hooks/useUnitCeActions';

import { evictUnitsQuery } from '@/modules/units/util';
import {
  GetUnitsDocument,
  GetUnitsQuery,
  GetUnitsQueryVariables,
  UnitTableRowFieldsFragment,
} from '@/types/gqlTypes';

interface Props {
  projectId: string;
  allowDeleteUnits: boolean;
  unitGroupId?: string; // if this table is for a specific unit group
  ceEnabled?: boolean; // whether to show CE details
}

// TODO(#7773) support "mark available" as a bulk action when CE is enabled
const UnitManagementTable: React.FC<Props> = ({
  projectId,
  unitGroupId,
  allowDeleteUnits,
  ceEnabled = false,
}) => {
  const { setUnitToDelete, renderSingleDeleteDialog, renderBulkDeleteButton } =
    useDeleteUnits({
      onSuccess: () => evictUnitsQuery(projectId, unitGroupId),
    });

  const columns: ColumnDef<UnitTableRowFieldsFragment>[] = useMemo(() => {
    return [
      UNIT_COLUMNS.unitType,
      UNIT_COLUMNS.unitId,
      UNIT_COLUMNS.unitOccupancyStatus,
      UNIT_COLUMNS.clientOccupants,
      ...(ceEnabled ? [UNIT_COLUMNS.ceReferralStatus] : []),
    ];
  }, [ceEnabled]);

  const filters = useFilters({
    type: 'UnitFilterOptions',
    omit: ['status'], // deprecated filter option, remove
    pickListArgs: { projectId },
  });

  const { project } = useProjectDashboardContext();
  const { getCeActions, loading } = useUnitCeActions({ project });

  const rowSecondaryActionConfigs = useCallback(
    (unit: UnitTableRowFieldsFragment) => {
      const actions = [];
      if (ceEnabled) {
        actions.push(...getCeActions(unit));
      }
      // If unit is occupied, link to hoh Enrollment
      const viewEnrollmentAction = getViewOccupantEnrollmentAction(unit);
      if (viewEnrollmentAction) {
        actions.push(viewEnrollmentAction);
      }

      // Delete unit
      if (allowDeleteUnits) {
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
    [allowDeleteUnits, ceEnabled, getCeActions, setUnitToDelete]
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
          includeCeFields: ceEnabled,
        }}
        queryDocument={GetUnitsDocument}
        columns={columns}
        pagePath='project.units'
        noData='No units'
        selectable={ceEnabled || allowDeleteUnits ? 'checkbox' : undefined}
        isRowSelectable={(row) => !!row.deletable}
        defaultFilterValues={{ unitGroup: unitGroupId }}
        filters={filters}
        recordType='Unit'
        EnhancedTableToolbarProps={{
          title: 'Manage Units',
          renderBulkAction: allowDeleteUnits
            ? (selectedUnitIds) => (
                <ButtonTooltipContainer title='Delete Selected Units'>
                  {renderBulkDeleteButton(selectedUnitIds as string[])}
                </ButtonTooltipContainer>
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
