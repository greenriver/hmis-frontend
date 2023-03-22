import UploadIcon from '@mui/icons-material/Upload';
import { Box, Chip, Link, Paper, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import { compact } from 'lodash-es';
import { useMemo, useState } from 'react';

import FileDialog from './files/FileModal';
import useFileActions from './files/useFileActions';

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
  useGetPickListQuery,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const AllFiles = () => {
  const { clientId } = useSafeParams() as { clientId: string };
  const [viewingFile, setViewingFile] = useState<
    FileFieldsFragment | undefined
  >();

  const { getActionsForFile, deleteFileDialog } = useFileActions({
    onDeleteFile: () => setViewingFile(undefined),
  });

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
          <Link component='button' onClick={() => setViewingFile(file)}>
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
              render: (file) => {
                const { editButton, deleteButton } = getActionsForFile(file);
                return (
                  <Stack
                    direction='row'
                    spacing={1}
                    justifyContent='flex-end'
                    flexGrow={1}
                  >
                    {editButton}
                    {deleteButton}
                  </Stack>
                );
              },
            },
          ]
        : []) as typeof columns),
    ];
  }, [canEdit, pickListData, getActionsForFile]);

  const viewingFileActions = useMemo(() => {
    if (!viewingFile) return [];
    const actions = getActionsForFile(viewingFile);
    return compact(Object.values(actions));
  }, [viewingFile, getActionsForFile]);

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
            id='add-client-file'
            Icon={UploadIcon}
            size='large'
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
          // rowLinkTo={canEdit ? rowLinkTo : undefined}
          columns={columns}
          pagePath='client.files'
          // fetchPolicy='cache-and-network'
        />
      </Paper>
      {viewingFile && (
        <FileDialog
          open={!!viewingFile}
          onClose={() => setViewingFile(undefined)}
          file={viewingFile}
          actions={<>{viewingFileActions}</>}
        />
      )}
      {deleteFileDialog}
    </>
  );
};

export default AllFiles;
