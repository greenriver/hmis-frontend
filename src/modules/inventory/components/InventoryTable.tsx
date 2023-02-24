import { Button, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { useCallback, useMemo, useState } from 'react';

import ButtonLink from '@/components/elements/ButtonLink';
import ConfirmationDialog from '@/components/elements/ConfirmDialog';
import { ColumnDef } from '@/components/elements/GenericTable';
import GenericTableWithData, {
  Props as GenericTableWithDataProps,
} from '@/modules/dataFetching/components/GenericTableWithData';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { parseAndFormatDateRange } from '@/modules/hmis/hmisUtil';
import { ProjectPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { useHasProjectPermissions } from '@/modules/permissions/useHasPermissionsHooks';
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
import generateSafePath from '@/utils/generateSafePath';

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
    render: (i: InventoryFieldsFragment) => (
      <HmisEnum value={i.householdType} enumMap={HmisEnums.HouseholdType} />
    ),
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
  const canEditProject = useHasProjectPermissions(projectId, [
    'canEditProjectDetails',
  ]);

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
              render: 'units.nodesCount' as keyof InventoryFieldsFragment,
            },
          ]),
      {
        header: 'Beds',
        render: 'beds.nodesCount' as keyof InventoryFieldsFragment,
      },
      ...(canEditProject
        ? [
            {
              key: 'actions',
              width: '1%',
              render: (record: InventoryFieldsFragment) => (
                <Stack direction='row' spacing={1}>
                  <ButtonLink
                    to={generateSafePath(Routes.MANAGE_INVENTORY_BEDS, {
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
                    to={generateSafePath(Routes.EDIT_INVENTORY, {
                      projectId,
                      inventoryId: record.id,
                    })}
                    size='small'
                    variant='outlined'
                  >
                    Edit
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
          ]
        : []),
    ];
  }, [projectId, es, canEditProject]);

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
      <ProjectPermissionsFilter
        id={projectId}
        permissions='canEditProjectDetails'
      >
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
      </ProjectPermissionsFilter>
    </>
  );
};
export default InventoryTable;
