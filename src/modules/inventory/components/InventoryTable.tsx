import { Button, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { useCallback, useMemo, useState } from 'react';
import { generatePath } from 'react-router-dom';

import ButtonLink from '@/components/elements/ButtonLink';
import ConfirmationDialog from '@/components/elements/ConfirmDialog';
import { ColumnDef } from '@/components/elements/GenericTable';
import GenericTableWithData, {
  Props as GenericTableWithDataProps,
} from '@/modules/dataFetching/components/GenericTableWithData';
import { parseAndFormatDateRange } from '@/modules/hmis/hmisUtil';
import { cache } from '@/providers/apolloClient';
import { Routes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  GetProjectInventoriesDocument,
  GetProjectInventoriesQuery,
  GetProjectInventoriesQueryVariables,
  InventoryFieldsFragment,
  useDeleteInventoryMutation,
} from '@/types/gqlTypes';

const columns: ColumnDef<InventoryFieldsFragment>[] = [
  {
    header: 'CoC Code',
    render: 'cocCode',
  },
  {
    header: 'Active Period',
    render: (i: InventoryFieldsFragment) =>
      parseAndFormatDateRange(i.inventoryStartDate, i.inventoryEndDate),
  },
  {
    header: 'Household Type',
    render: (i: InventoryFieldsFragment) =>
      HmisEnums.HouseholdType[i.householdType],
  },
];

interface Props
  extends Omit<
    GenericTableWithDataProps<
      GetProjectInventoriesQuery,
      GetProjectInventoriesQueryVariables,
      InventoryFieldsFragment
    >,
    'queryVariables' | 'queryDocument' | 'pagePath'
  > {
  projectId: string;
  es?: boolean;
}

const InventoryTable = ({ projectId, es = false, ...props }: Props) => {
  const [recordToDelete, setDelete] = useState<InventoryFieldsFragment | null>(
    null
  );

  const [deleteRecord, { loading: deleteLoading, error: deleteError }] =
    useDeleteInventoryMutation({
      onCompleted: (res) => {
        const id = res.deleteInventory?.inventory?.id;
        if (id) {
          setDelete(null);
          // Force re-fetch table
          cache.evict({ id: `Project:${projectId}`, fieldName: 'inventories' });
        }
      },
    });

  const handleDelete = useCallback(() => {
    if (!recordToDelete) return;
    deleteRecord({ variables: { input: { id: recordToDelete.id } } });
  }, [recordToDelete, deleteRecord]);
  if (deleteError) console.error(deleteError);

  const tableColumns = useMemo(() => {
    return [
      ...columns,
      ...(es
        ? []
        : [
            {
              header: 'Units',
              render: 'unitInventory' as keyof InventoryFieldsFragment,
            },
          ]),
      {
        header: 'Beds',
        render: 'bedInventory' as keyof InventoryFieldsFragment,
      },
      {
        key: 'actions',
        width: '1%',
        render: (record: InventoryFieldsFragment) => (
          <Stack direction='row' spacing={1}>
            <ButtonLink
              to={generatePath(Routes.MANAGE_INVENTORY_BEDS, {
                projectId,
                inventoryId: record.id,
              })}
              size='small'
              variant='outlined'
            >
              Beds
            </ButtonLink>
            <ButtonLink
              data-testid='updateButton'
              to={generatePath(Routes.EDIT_INVENTORY, {
                projectId,
                inventoryId: record.id,
              })}
              size='small'
              variant='outlined'
            >
              Update
            </ButtonLink>
            <Button
              data-testid='deleteButton'
              onClick={() => setDelete(record)}
              size='small'
              variant='outlined'
              color='error'
            >
              Delete
            </Button>
          </Stack>
        ),
      },
    ];
  }, [projectId, es]);

  return (
    <>
      <GenericTableWithData
        queryVariables={{ id: projectId }}
        queryDocument={GetProjectInventoriesDocument}
        columns={tableColumns}
        pagePath='project.inventories'
        noData='No inventory.'
        {...props}
      />
      <ConfirmationDialog
        id='deleteProjectCoc'
        open={!!recordToDelete}
        title='Delete Project CoC record'
        onConfirm={handleDelete}
        onCancel={() => setDelete(null)}
        loading={deleteLoading}
      >
        {recordToDelete && (
          <>
            <Typography>
              Are you sure you want to delete inventory record?
            </Typography>
            <Typography>This action cannot be undone.</Typography>
          </>
        )}
      </ConfirmationDialog>
    </>
  );
};
export default InventoryTable;
