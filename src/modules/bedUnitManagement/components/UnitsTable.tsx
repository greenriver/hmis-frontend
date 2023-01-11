import { LoadingButton } from '@mui/lab';

import { evictBedsQuery, evictUnitsQuery } from '../bedUnitUtil';

import { ColumnDef } from '@/components/elements/GenericTable';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import LiveTextInput from '@/modules/dataFetching/components/LiveTextInput';
import {
  GetUnitsDocument,
  Unit,
  UpdateUnitsDocument,
  UpdateUnitsMutation,
  UpdateUnitsMutationVariables,
  useDeleteUnitsMutation,
} from '@/types/gqlTypes';

const DeleteUnitButton = ({
  inventoryId,
  unitId,
}: {
  inventoryId: string;
  unitId: string;
}) => {
  const [deleteUnits, { loading, error }] = useDeleteUnitsMutation({
    onCompleted: () => {
      evictUnitsQuery(inventoryId);
      evictBedsQuery(inventoryId);
    },
  });
  if (error) throw error;

  return (
    <LoadingButton
      size='small'
      variant='outlined'
      loading={loading}
      onClick={() =>
        deleteUnits({
          variables: { input: { unitIds: [unitId], inventoryId } },
        })
      }
    >
      Delete
    </LoadingButton>
  );
};

const UnitsTable = ({ inventoryId }: { inventoryId: string }) => {
  const unitColumns: ColumnDef<Unit>[] = [
    {
      key: 'name',
      header: 'Unit Name',
      width: '30%',
      render: (unit) => (
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
      render: (unit) => `${unit.bedCount} beds`,
    },
    {
      key: 'delete',
      render: (unit) => (
        <DeleteUnitButton unitId={unit.id} inventoryId={inventoryId} />
      ),
    },
  ];

  return (
    <GenericTableWithData
      defaultPageSize={5}
      queryVariables={{ id: inventoryId }}
      queryDocument={GetUnitsDocument}
      columns={unitColumns}
      pagePath='inventory.units'
      noData='No units.'
    />
  );
};

export default UnitsTable;
