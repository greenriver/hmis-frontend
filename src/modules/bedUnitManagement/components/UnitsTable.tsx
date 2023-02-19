import { Typography } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';

import {
  evictBedsQuery,
  evictUnitPickList,
  evictUnitsQuery,
} from '../bedUnitUtil';

import ConfirmationDialog from '@/components/elements/ConfirmDialog';
import { ColumnDef } from '@/components/elements/GenericTable';
import LoadingButton from '@/components/elements/LoadingButton';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import LiveTextInput from '@/modules/dataFetching/components/LiveTextInput';
import {
  GetUnitsDocument,
  Unit,
  UnitFieldsFragment,
  UpdateUnitsDocument,
  UpdateUnitsMutation,
  UpdateUnitsMutationVariables,
  useDeleteUnitsMutation,
} from '@/types/gqlTypes';

const UnitsTable = ({ inventoryId }: { inventoryId: string }) => {
  const [recordToDelete, setDelete] = useState<UnitFieldsFragment | null>(null);

  const [deleteUnits, { loading, error }] = useDeleteUnitsMutation({
    onCompleted: () => {
      evictUnitsQuery(inventoryId);
      evictBedsQuery(inventoryId);
    },
  });
  if (error) throw error;

  const handleDelete = useCallback(() => {
    if (!recordToDelete) return;
    deleteUnits({
      variables: { input: { unitIds: [recordToDelete.id], inventoryId } },
    });
    setDelete(null);
  }, [recordToDelete, deleteUnits, inventoryId]);

  const unitColumns: ColumnDef<Unit>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Unit Name',
        width: '30%',
        render: (unit: UnitFieldsFragment) => (
          <LiveTextInput<UpdateUnitsMutation, UpdateUnitsMutationVariables>
            key={`${unit.id}-name`}
            queryDocument={UpdateUnitsDocument}
            initialValue={unit.name || ''}
            constructVariables={(name) => {
              return {
                input: { inventoryId, unitIds: [unit.id], name: name || null },
              };
            }}
            getValueFromResponse={(data) => {
              evictUnitPickList(inventoryId);
              const units = data?.updateUnits?.units || [];
              if (units.length === 1) {
                return units[0].name || '';
              }
              return '';
            }}
          />
        ),
      },
      {
        key: 'count',
        header: '# Beds',
        width: '70%',
        render: (unit: UnitFieldsFragment) => `${unit.bedCount} beds`,
      },
      {
        key: 'delete',
        render: (unit: UnitFieldsFragment) => (
          <LoadingButton
            size='small'
            variant='outlined'
            loading={loading}
            onClick={() => setDelete(unit)}
          >
            Delete
          </LoadingButton>
        ),
      },
    ],
    [inventoryId, loading]
  );

  return (
    <>
      <GenericTableWithData
        defaultPageSize={10}
        queryVariables={{ id: inventoryId }}
        queryDocument={GetUnitsDocument}
        columns={unitColumns}
        pagePath='inventory.units'
        noData='No units.'
      />
      <ConfirmationDialog
        id='deleteUnit'
        open={!!recordToDelete}
        title='Delete Unit'
        onConfirm={handleDelete}
        onCancel={() => setDelete(null)}
        loading={loading}
      >
        {recordToDelete && (
          <>
            <Typography>
              Are you sure you want to delete{' '}
              <strong>{recordToDelete.name || recordToDelete.id}</strong>?
            </Typography>
            {recordToDelete.bedCount > 0 && (
              <Typography>
                <b>
                  {recordToDelete.bedCount} bed
                  {recordToDelete.bedCount === 1 ? '' : 's'}
                </b>{' '}
                in this unit will also be deleted.
              </Typography>
            )}
          </>
        )}
      </ConfirmationDialog>
    </>
  );
};

export default UnitsTable;
