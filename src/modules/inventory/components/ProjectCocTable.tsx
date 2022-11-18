import { Button, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { isNil } from 'lodash-es';
import { useCallback, useState } from 'react';
import { generatePath } from 'react-router-dom';

import ButtonLink from '@/components/elements/ButtonLink';
import ConfirmationDialog from '@/components/elements/ConfirmDialog';
import { ColumnDef } from '@/components/elements/GenericTable';
import GenericTableWithData from '@/components/elements/GenericTableWithData';
import { Routes } from '@/routes/routes';
import {
  GetProjectProjectCocsDocument,
  GetProjectProjectCocsQuery,
  GetProjectProjectCocsQueryVariables,
  ProjectCocFieldsFragment,
  useDeleteProjectCocMutation,
} from '@/types/gqlTypes';

const columns: ColumnDef<ProjectCocFieldsFragment>[] = [
  {
    header: 'CoC Code',
    linkTreatment: true,
    render: 'cocCode',
  },
  {
    header: 'Geocode',
    render: 'geocode',
  },
  {
    header: 'Address',
    render: (c: ProjectCocFieldsFragment) =>
      [c.address1, c.address2, c.city, c.state, c.zip]
        .filter((f) => !isNil(f))
        .join(', '),
  },
];

const Table = ({ projectId }: { projectId: string }) => {
  const [recordToDelete, setDelete] = useState<ProjectCocFieldsFragment | null>(
    null
  );
  const [key, setKey] = useState(0);
  const [deleteRecord, { loading: deleteLoading, error: deleteError }] =
    useDeleteProjectCocMutation({
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
        GetProjectProjectCocsQuery,
        GetProjectProjectCocsQueryVariables,
        ProjectCocFieldsFragment
      >
        queryVariables={{ id: projectId }}
        queryDocument={GetProjectProjectCocsDocument}
        key={key}
        columns={[
          ...columns,
          {
            key: 'actions',
            width: '1%',
            render: (record) => (
              <Stack direction='row' spacing={1}>
                <ButtonLink
                  to={generatePath(Routes.EDIT_COC, {
                    projectId,
                    cocId: record.id,
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
        pagePath='project.projectCocs'
        noData='No Project CoC records.'
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
              Are you sure you want to delete Project CoC record for{' '}
              <strong>{recordToDelete.cocCode}</strong>?
            </Typography>
            <Typography>This action cannot be undone.</Typography>
          </>
        )}
      </ConfirmationDialog>
    </>
  );
};
export default Table;
