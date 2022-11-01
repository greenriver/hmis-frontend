import { Button, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { useCallback, useState } from 'react';
import { generatePath } from 'react-router-dom';

import ButtonLink from '@/components/elements/ButtonLink';
import ConfirmationDialog from '@/components/elements/ConfirmDialog';
import { ColumnDef } from '@/components/elements/GenericTable';
import GenericTableWithData from '@/components/elements/GenericTableWithData';
import { parseAndFormatDateRange } from '@/modules/hmis/hmisUtil';
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
    linkTreatment: true,
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
  {
    header: 'Units',
    render: 'unitInventory',
  },
  {
    header: 'Beds',
    render: 'bedInventory',
  },
];

const InventoryTable = ({ projectId }: { projectId: string }) => {
  const [recordToDelete, setDelete] = useState<InventoryFieldsFragment | null>(
    null
  );
  const [key, setKey] = useState(0);
  const [deleteRecord, { loading: deleteLoading, error: deleteError }] =
    useDeleteInventoryMutation({
      onCompleted: () => {
        setDelete(null);
        setKey((old) => old + 1);
      },
    });

  const handleDelete = useCallback(() => {
    if (!recordToDelete) return;
    deleteRecord({ variables: { input: { id: recordToDelete.id } } });
  }, [recordToDelete, deleteRecord]);
  if (deleteError) console.error(deleteError);

  return (
    <>
      <GenericTableWithData<
        GetProjectInventoriesQuery,
        GetProjectInventoriesQueryVariables,
        InventoryFieldsFragment
      >
        key={key}
        queryVariables={{ id: projectId }}
        queryDocument={GetProjectInventoriesDocument}
        columns={[
          ...columns,
          {
            key: 'actions',
            width: '1%',
            render: (record) => (
              <Stack direction='row' spacing={1}>
                <ButtonLink
                  to={generatePath(Routes.EDIT_INVENTORY, {
                    projectId,
                    inventoryId: record.id,
                  })}
                  size='small'
                  variant='outlined'
                >
                  Edit
                </ButtonLink>
                <Button
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
        ]}
        toNodes={(data: GetProjectInventoriesQuery) =>
          data.project?.inventories?.nodes || []
        }
        toNodesCount={(data: GetProjectInventoriesQuery) =>
          data.project?.inventories?.nodesCount
        }
        noData='No inventory.'
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
