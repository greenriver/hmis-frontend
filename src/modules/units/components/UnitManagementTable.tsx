import { useCallback, useMemo } from 'react';
import UnitOccupants from './UnitOccupants';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useFilters } from '@/modules/hmis/filterUtil';
import { useDeleteUnits } from '@/modules/units/hooks/useDeleteUnits';
import { useUnitCeActions } from '@/modules/units/hooks/useUnitCeActions';
import { useUnitCeColumns } from '@/modules/units/hooks/useUnitCeColumns';
import {
  GetUnitsDocument,
  GetUnitsQuery,
  GetUnitsQueryVariables,
  UnitFieldsFragment,
} from '@/types/gqlTypes';

const UnitManagementTable = ({
  projectId,
  allowDeleteUnits,
}: {
  projectId: string;
  allowDeleteUnits: boolean;
}) => {
  const { setUnitToDelete, renderSingleDeleteDialog, renderBulkDeleteButton } =
    useDeleteUnits({
      projectId,
    });

  const ceColumns = useUnitCeColumns();
  const columns: ColumnDef<UnitFieldsFragment>[] = useMemo(() => {
    return [
      {
        header: 'Unit Type',
        key: 'unitType',
        render: (unit) => unit.unitType?.description,
      },
      {
        header: 'Unit ID',
        key: 'unitId',
        render: 'id',
      },
      {
        header: 'Active Status',
        key: 'activeStatus',
        render: (unit) => (unit.occupants.length > 0 ? 'Filled' : 'Available'),
      },
      {
        header: 'Client(s)',
        key: 'clients',
        render: (unit) => <UnitOccupants unit={unit} />,
      },
      ...ceColumns,
    ];
  }, [ceColumns]);

  const filters = useFilters({
    type: 'UnitFilterOptions',
  });

  const { getCeActions, loading } = useUnitCeActions({ projectId });

  const rowSecondaryActionConfigs = useCallback(
    (unit: UnitFieldsFragment) => {
      return [
        ...(allowDeleteUnits
          ? [
              {
                title: 'Delete Unit',
                key: 'delete',
                ariaLabel: `Delete Unit ${unit.id}`,
                onClick: () => setUnitToDelete(unit.id),
                disabled: unit.occupants.length > 0,
                disabledReason: 'Currently assigned units cannot be deleted',
              },
            ]
          : []),
        ...getCeActions(unit),
      ];
    },
    [allowDeleteUnits, getCeActions, setUnitToDelete]
  );

  return (
    <>
      <GenericTableWithData<
        GetUnitsQuery,
        GetUnitsQueryVariables,
        UnitFieldsFragment
      >
        defaultPageSize={10}
        queryVariables={{ id: projectId }}
        queryDocument={GetUnitsDocument}
        columns={columns}
        pagePath='project.units'
        noData='No units'
        selectable={allowDeleteUnits ? 'row' : undefined}
        isRowSelectable={(row) => row.occupants.length === 0}
        filters={filters}
        recordType='Unit'
        EnhancedTableToolbarProps={{
          title: 'Unit Management',
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
      />
      {renderSingleDeleteDialog()}
    </>
  );
};
export default UnitManagementTable;
