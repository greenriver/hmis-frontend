import { Button } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';

import useSafeParams from '@/hooks/useSafeParams';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import { cache } from '@/providers/apolloClient';
import { ClientDashboardRoutes } from '@/routes/routes';
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
        editButton: file.access.canManage ? editButton : null,
        deleteButton: file.access.canManage ? deleteButton : null,
      } as const;
    },
    [clientId, onDeleteFile]
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
