import { LoadingButton } from '@mui/lab';

import { evictBedsQuery, evictUnitsQuery } from '../bedUnitUtil';

import { ColumnDef } from '@/components/elements/GenericTable';
import GenericTableWithData from '@/components/elements/GenericTableWithData';
import TextInput from '@/components/elements/input/TextInput';
import {
  GetUnitsDocument,
  Unit,
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
      render: (unit) => <TextInput value={unit.name || ''} />,
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
