import UploadIcon from '@mui/icons-material/Upload';
import { Box, Chip, Link, Paper } from '@mui/material';
import { useMemo, useState } from 'react';

import PageTitle from '../layout/PageTitle';

import FileDialog from './files/FileModal';
import useFileActions from './files/useFileActions';

import ButtonLink from '@/components/elements/ButtonLink';
import { ColumnDef } from '@/components/elements/GenericTable';
import useSafeParams from '@/hooks/useSafeParams';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { parseAndFormatDateTime } from '@/modules/hmis/hmisUtil';
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
            tabIndex={-1}
          >
            {file.name}
          </Link>
        ),
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
        header: 'Uploaded At',
        render: (file) =>
          `${parseAndFormatDateTime(file.createdAt)}${
            file.uploadedBy?.name ? ` by ${file.uploadedBy?.name}` : ''
          }`,
      },
      // {
      //   header: 'Last Updated',
      //   render: (file) =>
      //     `${parseAndFormatDateTime(file.updatedAt)}${
      //       file.updatedBy?.name ? ` by ${file.updatedBy?.name}` : ''
      //     }`,
      // },
    ];
  }, [pickListData]);

  return (
    <>
      <PageTitle
        title='Files'
        actions={
          canEdit && (
            <ButtonLink
              to={generateSafePath(DashboardRoutes.NEW_FILE, {
                clientId,
              })}
              data-testid='addClientFileButton'
              Icon={UploadIcon}
            >
              Upload File
            </ButtonLink>
          )
        }
      />
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
          handleRowClick={(file) => setViewingFile(file)}
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
