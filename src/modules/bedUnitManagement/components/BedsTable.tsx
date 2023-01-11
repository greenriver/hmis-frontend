import { LoadingButton } from '@mui/lab';
import { useMemo } from 'react';

import { evictBedsQuery, evictUnitPickList } from '../bedUnitUtil';

import { ColumnDef } from '@/components/elements/GenericTable';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import LiveSelect from '@/modules/dataFetching/components/LiveSelect';
import LiveTextInput from '@/modules/dataFetching/components/LiveTextInput';
import { HmisEnums } from '@/types/gqlEnums';
import {
  Bed,
  GetBedsDocument,
  PickListOption,
  PickListType,
  UpdateBedsDocument,
  UpdateBedsMutation,
  UpdateBedsMutationVariables,
  useDeleteBedsMutation,
  useGetPickListQuery,
} from '@/types/gqlTypes';

const DeleteBedButton = ({
  inventoryId,
  bedId,
}: {
  inventoryId: string;
  bedId: string;
}) => {
  const [deleteBeds, { loading, error }] = useDeleteBedsMutation({
    onCompleted: () => {
      // evictUnitsQuery(inventoryId);
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
        deleteBeds({
          variables: { input: { bedIds: [bedId], inventoryId } },
        })
      }
    >
      Delete
    </LoadingButton>
  );
};

const UnitsTable = ({ inventoryId }: { inventoryId: string }) => {
  const { data } = useGetPickListQuery({
    variables: {
      pickListType: PickListType.AvailableUnits,
      relationId: inventoryId,
    },
    fetchPolicy: 'network-only',
  });
  const pickList: PickListOption[] = useMemo(() => {
    return data?.pickList || [];
  }, [data]);

  const bedColumns: ColumnDef<Bed>[] = [
    {
      key: 'type',
      header: 'Bed Type',
      width: '30%',
      render: (bed) => HmisEnums.InventoryBedType[bed.bedType],
    },
    {
      key: 'name',
      header: 'Name',
      width: '35%',
      render: (bed) => (
        <LiveTextInput<UpdateBedsMutation, UpdateBedsMutationVariables>
          key={`${bed.id}-name`}
          queryDocument={UpdateBedsDocument}
          initialValue={bed.name || ''}
          constructVariables={(name) => {
            return {
              input: { inventoryId, bedIds: [bed.id], name: name || null },
            };
          }}
          getValueFromResponse={(data) => {
            evictUnitPickList(inventoryId);
            const beds = data?.updateBeds?.beds || [];
            if (beds.length === 1) {
              return beds[0].name || '';
            }
            return '';
          }}
        />
      ),
    },
    {
      key: 'unit',
      header: 'Unit',
      width: '35%',
      render: (bed) => (
        <LiveSelect<UpdateBedsMutation, UpdateBedsMutationVariables>
          options={pickList}
          textInputProps={{
            placeholder: 'Select unit',
          }}
          value={pickList.find(({ code }) => code === bed.unit.id) || null}
          size='small'
          disableClearable
          queryDocument={UpdateBedsDocument}
          constructVariables={(option: PickListOption) => {
            return {
              input: { inventoryId, bedIds: [bed.id], unit: option.code },
            };
          }}
          getOptionFromResponse={(data) => {
            const beds = data?.updateBeds?.beds || [];
            if (beds && beds.length === 1) {
              const unitId = beds[0].unit.id;
              return pickList.find(({ code }) => code === unitId) || null;
            }
            return null;
          }}
        />
      ),
    },
    {
      key: 'delete',
      render: (bed) => (
        <DeleteBedButton bedId={bed.id} inventoryId={inventoryId} />
      ),
    },
  ];
  return (
    <GenericTableWithData
      defaultPageSize={5}
      queryVariables={{ id: inventoryId }}
      queryDocument={GetBedsDocument}
      columns={bedColumns}
      pagePath='inventory.beds'
      noData='No beds.'
    />
  );
};

export default UnitsTable;
