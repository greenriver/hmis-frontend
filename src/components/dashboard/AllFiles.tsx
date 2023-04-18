import UploadIcon from '@mui/icons-material/Upload';
import { Box, Chip, Link, Paper, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';

import FileDialog from './files/FileModal';
import useFileActions from './files/useFileActions';

import ButtonLink from '@/components/elements/ButtonLink';
import { ColumnDef } from '@/components/elements/GenericTable';
import useSafeParams from '@/hooks/useSafeParams';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import {
  useClientPermissions,
  useHasClientPermissions,
} from '@/modules/permissions/useHasPermissionsHooks';
import { DashboardRoutes } from '@/routes/routes';
import {
  FileFieldsFragment,
  GetClientFilesDocument,
  GetClientFilesQuery,
  GetClientFilesQueryVariables,
  PickListType,
  useGetPickListQuery,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const FileActions: React.FC<{
  clientId: string;
  file: FileFieldsFragment;
  onDone?: (file: FileFieldsFragment) => any;
  noDownload?: boolean;
}> = ({ clientId, file, onDone = () => {}, noDownload }) => {
  const { getActionsForFile, deleteFileDialog } = useFileActions({
    onDeleteFile: () => onDone(file),
  });

  const [perms] = useClientPermissions(clientId);
  const { canManageOwnClientFiles, canManageAnyClientFiles } = perms || {};
  const canManage =
    canManageAnyClientFiles || (canManageOwnClientFiles && file.ownFile);

  const { editButton, deleteButton, downloadButton } = getActionsForFile(file);
  return (
    <>
      {!noDownload && downloadButton}
      {canManage && (
        <>
          {editButton}
          {deleteButton}
          {deleteFileDialog}
        </>
      )}
    </>
  );
};

const AllFiles = () => {
  const { clientId } = useSafeParams() as { clientId: string };
  const [viewingFile, setViewingFile] = useState<
    FileFieldsFragment | undefined
  >();

  const [canEdit] = useHasClientPermissions(clientId, [
    'canManageAnyClientFiles',
    'canManageOwnClientFiles',
  ]);
  const { data: pickListData } = useGetPickListQuery({
    variables: { pickListType: PickListType.AvailableFileTypes },
  });

  const columns: ColumnDef<FileFieldsFragment>[] = useMemo(() => {
    return [
      {
        header: 'Name',
        render: (file) => (
          <Link
            component='button'
            onClick={() => setViewingFile(file)}
            align='left'
          >
            {file.name}
          </Link>
        ),
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
                return (
                  <Chip
                    key={item?.code || tag}
                    label={item?.label || tag}
                    id={`tag-${item?.code || tag}`}
                    size='small'
                  />
                );
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
                  <FileActions
                    clientId={clientId}
                    file={file}
                    onDone={() => setViewingFile(undefined)}
                    noDownload
                  />
                </Stack>
              ),
            },
          ]
        : []) as typeof columns),
    ];
  }, [canEdit, pickListData, clientId]);

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
            data-testid='addClientFileButton'
            Icon={UploadIcon}
          >
            Upload File
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
          columns={columns}
          pagePath='client.files'
        />
      </Paper>
      {viewingFile && (
        <FileDialog
          open={!!viewingFile}
          onClose={() => setViewingFile(undefined)}
          file={viewingFile}
          actions={
            <FileActions
              clientId={clientId}
              file={viewingFile}
              onDone={() => setViewingFile(undefined)}
            />
          }
        />
      )}
    </>
  );
};

export default AllFiles;
