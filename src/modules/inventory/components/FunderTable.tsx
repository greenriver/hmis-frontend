import { Button, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { useState, useCallback } from 'react';
import { generatePath } from 'react-router-dom';

import ButtonLink from '@/components/elements/ButtonLink';
import ConfirmationDialog from '@/components/elements/ConfirmDialog';
import { ColumnDef } from '@/components/elements/GenericTable';
import GenericTableWithData from '@/components/elements/GenericTableWithData';
import { Routes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  FunderFieldsFragment,
  GetProjectFundersDocument,
  GetProjectFundersQuery,
  GetProjectFundersQueryVariables,
  useDeleteFunderMutation,
} from '@/types/gqlTypes';

const columns: ColumnDef<FunderFieldsFragment>[] = [
  {
    header: 'Funder',
    linkTreatment: true,
    render: (f: FunderFieldsFragment) => HmisEnums.FundingSource[f.funder],
  },
  { header: 'Grant ID', render: 'grantId' },
];

const FunderTable = ({ projectId }: { projectId: string }) => {
  const [recordToDelete, setDelete] = useState<FunderFieldsFragment | null>(
    null
  );
  const [key, setKey] = useState(0);
  const [deleteRecord, { loading: deleteLoading, error: deleteError }] =
    useDeleteFunderMutation({
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
        GetProjectFundersQuery,
        GetProjectFundersQueryVariables,
        FunderFieldsFragment
      >
        key={key}
        queryVariables={{ id: projectId }}
        queryDocument={GetProjectFundersDocument}
        columns={[
          ...columns,
          {
            key: 'actions',
            width: '1%',
            render: (record) => (
              <Stack direction='row' spacing={1}>
                <ButtonLink
                  to={generatePath(Routes.EDIT_FUNDER, {
                    projectId,
                    funderId: record.id,
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
        toNodes={(data: GetProjectFundersQuery) =>
          data.project?.funders?.nodes || []
        }
        toNodesCount={(data: GetProjectFundersQuery) =>
          data.project?.funders?.nodesCount
        }
        noData='No funding sources.'
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
              Are you sure you want to delete funding source record for{' '}
              <strong>{HmisEnums.FundingSource[recordToDelete.funder]}</strong>?
            </Typography>
            <Typography>This action cannot be undone.</Typography>
          </>
        )}
      </ConfirmationDialog>
    </>
  );
};
export default FunderTable;
