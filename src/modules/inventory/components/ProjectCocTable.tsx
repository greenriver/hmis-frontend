import { Button, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { isNil } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';

import ButtonLink from '@/components/elements/ButtonLink';
import ConfirmationDialog from '@/components/elements/ConfirmDialog';
import { ColumnDef } from '@/components/elements/GenericTable';
import GenericTableWithData, {
  Props as GenericTableWithDataProps,
} from '@/modules/dataFetching/components/GenericTableWithData';
import { ProjectPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { useHasProjectPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { cache } from '@/providers/apolloClient';
import { Routes } from '@/routes/routes';
import {
  GetProjectProjectCocsDocument,
  GetProjectProjectCocsQuery,
  GetProjectProjectCocsQueryVariables,
  ProjectCocFieldsFragment,
  useDeleteProjectCocMutation,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

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

interface Props
  extends Omit<
    GenericTableWithDataProps<
      GetProjectProjectCocsQuery,
      GetProjectProjectCocsQueryVariables,
      ProjectCocFieldsFragment
    >,
    'queryVariables' | 'queryDocument' | 'pagePath'
  > {
  projectId: string;
}

const ProjectCocTable = ({ projectId, ...props }: Props) => {
  const [recordToDelete, setDelete] = useState<ProjectCocFieldsFragment | null>(
    null
  );
  const canEditProject = useHasProjectPermissions(projectId, [
    'canEditProjectDetails',
  ]);

  const [deleteRecord, { loading: deleteLoading, error: deleteError }] =
    useDeleteProjectCocMutation({
      onCompleted: (res) => {
        const id = res.deleteProjectCoc?.projectCoc?.id;
        if (id) {
          setDelete(null);
          // Force re-fetch table
          cache.evict({ id: `Project:${projectId}`, fieldName: 'projectCocs' });
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
      ...(canEditProject
        ? [
            {
              key: 'actions',
              width: '1%',
              render: (record: ProjectCocFieldsFragment) => (
                <Stack direction='row' spacing={1}>
                  <ButtonLink
                    data-testid='updateButton'
                    to={generateSafePath(Routes.EDIT_COC, {
                      projectId,
                      cocId: record.id,
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
  }, [projectId, canEditProject]);

  return (
    <>
      <GenericTableWithData
        queryVariables={{ id: projectId }}
        queryDocument={GetProjectProjectCocsDocument}
        columns={tableColumns}
        pagePath='project.projectCocs'
        noData='No Project CoC records.'
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
                Are you sure you want to delete Project CoC record for{' '}
                <strong>{recordToDelete.cocCode}</strong>?
              </Typography>
              <Typography>This action cannot be undone.</Typography>
            </>
          )}
        </ConfirmationDialog>
      </ProjectPermissionsFilter>
    </>
  );
};
export default ProjectCocTable;
