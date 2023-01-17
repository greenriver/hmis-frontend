import { LoadingButton } from '@mui/lab';
import { useMemo } from 'react';

import {
  evictBedsQuery,
  evictUnitPickList,
  evictUnitsQuery,
} from '../bedUnitUtil';

import { ColumnDef } from '@/components/elements/GenericTable';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import LiveSelect from '@/modules/dataFetching/components/LiveSelect';
import LiveTextInput from '@/modules/dataFetching/components/LiveTextInput';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
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
      width: '20%',
      render: (bed) => (
        <HmisEnum value={bed.bedType} enumMap={HmisEnums.InventoryBedType} />
      ),
    },
    {
      key: 'name',
      header: 'Name',
      width: '25%',
      render: (bed) => (
        <LiveTextInput<UpdateBedsMutation, UpdateBedsMutationVariables>
          key={`${bed.id}-name`}
          queryDocument={UpdateBedsDocument}
          initialValue={bed.name || ''}
          constructVariables={(name) => {
            return {
              input: {
                inventoryId,
                bedIds: [bed.id],
                name: name || null,
                gender: bed.gender,
              },
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
      key: 'gender',
      header: 'Gender',
      width: '10%',
      render: (bed) => (
        <LiveSelect<UpdateBedsMutation, UpdateBedsMutationVariables>
          options={[{ code: 'M' }, { code: 'F' }]}
          textInputProps={{
            placeholder: 'Any',
          }}
          value={bed.gender ? { code: bed.gender } : null}
          size='small'
          queryDocument={UpdateBedsDocument}
          constructVariables={(option: PickListOption | null) => {
            return {
              input: {
                inventoryId,
                bedIds: [bed.id],
                gender: option?.code || null,
                name: bed.name,
              },
            };
          }}
          getOptionFromResponse={(data) => {
            const beds = data?.updateBeds?.beds || [];
            if (beds && beds.length === 1) {
              const gender = beds[0].gender;
              if (gender) return { code: gender };
            }
            return null;
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
          key={
            // re-render if unit name changes
            pickList.find(({ code }) => code === bed.unit.id)?.label || bed.id
          }
          options={pickList}
          textInputProps={{
            placeholder: 'Select unit',
          }}
          value={pickList.find(({ code }) => code === bed.unit.id) || null}
          size='small'
          disableClearable
          queryDocument={UpdateBedsDocument}
          constructVariables={(option) => {
            return {
              input: {
                inventoryId,
                bedIds: [bed.id],
                unit: option?.code,
                gender: bed.gender,
                name: bed.name,
              },
            };
          }}
          getOptionFromResponse={(data) => {
            evictUnitsQuery(inventoryId);
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
      defaultPageSize={10}
      queryVariables={{ id: inventoryId }}
      queryDocument={GetBedsDocument}
      columns={bedColumns}
      pagePath='inventory.beds'
      noData='No beds.'
    />
  );
};

export default UnitsTable;
