import { Button } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';

import { cache } from '@/app/apolloClient';
import { ClientDashboardRoutes } from '@/app/routes';
import useSafeParams from '@/hooks/useSafeParams';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import { useHasClientPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import {
  DeleteClientFileDocument,
  DeleteClientFileMutation,
  DeleteClientFileMutationVariables,
  FileFieldsFragment,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

export type UseFileActionsArgs = {
  onDeleteFile?: (id: string) => any;
};

const useFileActions = ({ onDeleteFile = () => {} }: UseFileActionsArgs) => {
  const { clientId } = useSafeParams() as { clientId: string };

  const [canEdit] = useHasClientPermissions(clientId, [
    'canManageAnyClientFiles',
    'canManageOwnClientFiles',
  ]);
  const [canEditAny] = useHasClientPermissions(clientId, [
    'canManageAnyClientFiles',
  ]);

  const getActionsForFile = useCallback(
    (file: FileFieldsFragment) => {
      const downloadButton = (
        <Button
          key='download'
          data-testid='downloadFile'
          component='a'
          href={file.url || ''}
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
          to={generateSafePath(ClientDashboardRoutes.EDIT_FILE, {
            clientId,
            fileId: file.id,
          })}
        >
          Edit
        </Button>
      );

      const deleteButton = (
        <DeleteMutationButton<
          DeleteClientFileMutation,
          DeleteClientFileMutationVariables
        >
          queryDocument={DeleteClientFileDocument}
          variables={{ input: { fileId: file.id } }}
          idPath={'deleteClientFile.file.id'}
          recordName='File'
          onSuccess={() => {
            cache.evict({
              id: `File:${file.id}`,
            });
            onDeleteFile(file.id);
          }}
        >
          Delete
        </DeleteMutationButton>
      );

      return {
        downloadButton: file.url ? downloadButton : null,
        editButton: canEdit || canEditAny || file.ownFile ? editButton : null,
        deleteButton:
          canEdit || canEditAny || file.ownFile ? deleteButton : null,
      } as const;
    },
    [canEditAny, canEdit, clientId, onDeleteFile]
  );

  return useMemo(
    () =>
      ({
        getActionsForFile,
      }) as const,
    [getActionsForFile]
  );
};

export default useFileActions;
