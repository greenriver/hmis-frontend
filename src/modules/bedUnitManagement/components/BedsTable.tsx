import { LoadingButton } from '@mui/lab';
import { Typography } from '@mui/material';

import { evictUnitsQuery } from '../bedUnitUtil';

import { ColumnDef } from '@/components/elements/GenericTable';
import GenericTableWithData from '@/components/elements/GenericTableWithData';
import GenericSelect from '@/components/elements/input/GenericSelect';
import TextInput from '@/components/elements/input/TextInput';
import { HmisEnums } from '@/types/gqlEnums';
import {
  Bed,
  GetBedsDocument,
  PickListOption,
  PickListType,
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
      evictUnitsQuery(inventoryId);
      // evictBedsQuery(inventoryId);
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
  const { data, loading } = useGetPickListQuery({
    variables: {
      pickListType: PickListType.AvailableUnits,
      relationId: inventoryId,
    },
    fetchPolicy: 'network-only',
  });
  console.log('loading unit list', loading);

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
      render: (bed) => <TextInput value={bed.name || ''} />,
    },
    // {
    //   key: 'gender',
    //   header: 'Gender',
    //   width: '20%',
    //   render: (bed) => <TextInput value={bed.gender || ''} placeholder='Any' />,
    // },
    {
      key: 'unit',
      header: 'Unit',
      width: '35%',
      render: (bed) => (
        <GenericSelect<PickListOption, false, false>
          options={data?.pickList || []}
          textInputProps={{
            placeholder: 'Select unitrelationship',
          }}
          value={(data?.pickList || []).find(
            ({ code }) => code === bed.unit.id
          )}
          size='small'
          renderOption={(props, option) => (
            <li {...props} key={option.code}>
              <Typography variant='body2'>{option.label}</Typography>
            </li>
          )}
          fullWidth
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
