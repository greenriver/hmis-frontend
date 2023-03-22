import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import { uniq } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';

import ButtonLink from '@/components/elements/ButtonLink';
import { ColumnDef } from '@/components/elements/GenericTable';
import useSafeParams from '@/hooks/useSafeParams';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useHasClientPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { DashboardRoutes } from '@/routes/routes';
import {
  FileFieldsFragment,
  GetClientFilesDocument,
  GetClientFilesQuery,
  GetClientFilesQueryVariables,
  PickListType,
  useDeleteClientFileMutation,
  useGetClientFilesQuery,
  useGetPickListQuery,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const AllFiles = () => {
  const { clientId } = useSafeParams() as { clientId: string };
  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  const [canEdit] = useHasClientPermissions(clientId, [
    'canManageAnyClientFiles',
    'canManageOwnClientFiles',
  ]);
  const [canEditAny] = useHasClientPermissions(clientId, [
    'canManageAnyClientFiles',
  ]);
  const { data: pickListData } = useGetPickListQuery({
    variables: { pickListType: PickListType.AvailableFileTypes },
  });
  const { refetch } = useGetClientFilesQuery({ variables: { id: clientId } });

  const [deleteFile] = useDeleteClientFileMutation();

  const handleDeleteFile = useCallback(
    (fileId: string) =>
      deleteFile({
        variables: { input: { fileId } },
      }).finally(() => {
        refetch().then(() =>
          setDeletingIds((ids) => ids.filter((id) => id !== fileId))
        );
      }),
    [deleteFile, refetch]
  );

  const rowLinkTo = useCallback(
    (file: FileFieldsFragment) =>
      generateSafePath(DashboardRoutes.EDIT_FILE, {
        clientId,
        fileId: file.id,
      }),
    [clientId]
  );

  const columns: ColumnDef<FileFieldsFragment>[] = useMemo(() => {
    return [
      {
        header: 'Name',
        render: (file) => file.name,
        linkTreatment: true,
      },
      {
        header: 'Tags',
        render: (file) =>
          pickListData ? (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {file.tags.map((tag) => {
                const item = pickListData.pickList.find(
                  (type) => type.code == tag
                );
                return <Chip label={item?.label || tag} size='small' />;
              })}
            </Box>
          ) : null,
      },
      {
        header: 'Last Updated',
        render: (file) =>
          `${format(new Date(file.updatedAt), 'MM/dd/yyyy h:mm a')}${
            file.updatedBy ? ` by ${file.updatedBy?.name}` : ''
          }`,
      },
      ...((canEdit
        ? [
            {
              header: 'Actions',
              width: '1%',
              render: (file) => (
                <Stack
                  direction='row'
                  spacing={1}
                  justifyContent='flex-end'
                  flexGrow={1}
                >
                  {file.url && (
                    <Button
                      data-testid='downloadFile'
                      component='a'
                      onClick={(e) => e.stopPropagation()}
                      href={file.url}
                      target='_blank'
                      size='small'
                      variant='outlined'
                    >
                      Download
                    </Button>
                  )}
                  {(canEditAny || file.ownFile) && (
                    <>
                      <Button
                        data-testid='editFile'
                        size='small'
                        variant='outlined'
                        color='secondary'
                      >
                        Edit
                      </Button>
                      <Button
                        data-testid='deleteFile'
                        disabled={deletingIds.includes(file.id)}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setDeletingIds((ids) => uniq([...ids, file.id]));
                          handleDeleteFile(file.id);
                        }}
                        size='small'
                        variant='outlined'
                        endIcon={
                          deletingIds.includes(file.id) && (
                            <CircularProgress size={15} color='inherit' />
                          )
                        }
                        color='error'
                      >
                        {deletingIds.includes(file.id) ? 'Deleting' : 'Delete'}
                      </Button>
                    </>
                  )}
                </Stack>
              ),
            },
          ]
        : []) as typeof columns),
    ];
  }, [canEdit, canEditAny, pickListData, handleDeleteFile, deletingIds]);

  return (
    <>
      <Stack
        gap={3}
        direction='row'
        justifyContent={'space-between'}
        sx={{ mb: 2, pr: 1, alignItems: 'center' }}
      >
        <Typography variant='h4'>All Files</Typography>
        {canEdit && (
          <ButtonLink
            to={generateSafePath(DashboardRoutes.NEW_FILE, {
              clientId,
            })}
            Icon={AddIcon}
          >
            Add File
          </ButtonLink>
        )}
      </Stack>
      <Paper>
        <GenericTableWithData<
          GetClientFilesQuery,
          GetClientFilesQueryVariables,
          FileFieldsFragment
        >
          queryVariables={{ id: clientId }}
          queryDocument={GetClientFilesDocument}
          rowLinkTo={canEdit ? rowLinkTo : undefined}
          columns={columns}
          pagePath='client.files'
          fetchPolicy='cache-and-network'
        />
      </Paper>
    </>
  );
};

export default AllFiles;
