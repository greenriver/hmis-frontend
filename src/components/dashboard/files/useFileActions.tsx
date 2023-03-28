import { Button, Typography } from '@mui/material';
import { uniq } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';

import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import LoadingButton from '@/components/elements/LoadingButton';
import useSafeParams from '@/hooks/useSafeParams';
import { useHasClientPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { cache } from '@/providers/apolloClient';
import { DashboardRoutes } from '@/routes/routes';
import {
  FileFieldsFragment,
  useDeleteClientFileMutation,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

export type UseFileActionsArgs = {
  onDeleteFile?: (id: string) => any;
};

const useFileActions = ({ onDeleteFile = () => {} }: UseFileActionsArgs) => {
  const { clientId } = useSafeParams() as { clientId: string };
  const [deletingIds, setDeletingIds] = useState<string[]>([]);
  const [fileToDelete, setFileToDelete] = useState<
    FileFieldsFragment | undefined
  >();
  const [deleting, setDeleting] = useState<boolean>(false);

  const [canEdit] = useHasClientPermissions(clientId, [
    'canManageAnyClientFiles',
    'canManageOwnClientFiles',
  ]);
  const [canEditAny] = useHasClientPermissions(clientId, [
    'canManageAnyClientFiles',
  ]);

  const [deleteFile] = useDeleteClientFileMutation();

  const handleDeleteFile = useCallback(
    (fileId: string) => {
      setDeletingIds((ids) => uniq([...ids, fileId]));
      setDeleting(true);
      return deleteFile({
        variables: { input: { fileId } },
      }).finally(() => {
        cache.evict({
          id: `File:${fileId}`,
        });
        setDeletingIds((ids) => ids.filter((id) => id !== fileId));
        setFileToDelete(undefined);
        setDeleting(false);
        onDeleteFile(fileId);
      });
    },
    [deleteFile, onDeleteFile]
  );

  const getActionsForFile = useCallback(
    (file: FileFieldsFragment) => {
      const downloadButton = (
        <Button
          key='download'
          data-testid='downloadFile'
          component='a'
          href={file.url}
          target='_blank'
          size='small'
          variant='outlined'
        >
          Download
        </Button>
      );

      const editButton = (
        <Button
          key='edit'
          data-testid='editFile'
          size='small'
          variant='outlined'
          color='secondary'
          component={ReactRouterLink}
          to={generateSafePath(DashboardRoutes.EDIT_FILE, {
            clientId,
            fileId: file.id,
          })}
        >
          Edit
        </Button>
      );

      const deleteButton = (
        <LoadingButton
          key='delete'
          data-testid='deleteFile'
          disabled={deletingIds.includes(file.id)}
          onClick={() => {
            setFileToDelete(file);
          }}
          size='small'
          variant='outlined'
          loading={deletingIds.includes(file.id)}
          color='error'
        >
          {deletingIds.includes(file.id) ? 'Deleting' : 'Delete'}
        </LoadingButton>
      );

      return {
        downloadButton: file.url ? downloadButton : null,
        editButton: canEdit || canEditAny || file.ownFile ? editButton : null,
        deleteButton:
          canEdit || canEditAny || file.ownFile ? deleteButton : null,
      } as const;
    },
    [canEditAny, canEdit, clientId, deletingIds]
  );

  const deleteFileDialog = useMemo(
    () => (
      <ConfirmationDialog
        id='deleteFile'
        open={!!fileToDelete}
        title='Delete File'
        onConfirm={() => fileToDelete && handleDeleteFile(fileToDelete.id)}
        onCancel={() => setFileToDelete(undefined)}
        loading={deleting}
      >
        {fileToDelete && (
          <>
            <Typography>Are you sure you want to delete this file?</Typography>
            <Typography>This action cannot be undone.</Typography>
          </>
        )}
      </ConfirmationDialog>
    ),
    [deleting, fileToDelete, handleDeleteFile]
  );

  return useMemo(
    () =>
      ({
        getActionsForFile,
        deleteFileDialog,
      } as const),
    [getActionsForFile, deleteFileDialog]
  );
};

export default useFileActions;
