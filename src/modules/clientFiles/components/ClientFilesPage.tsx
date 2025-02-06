import UploadIcon from '@mui/icons-material/Upload';
import { Box, Chip, Paper, Typography } from '@mui/material';
import { useMemo, useState } from 'react';

import useFileActions from '../hooks/useFileActions';

import ButtonLink from '@/components/elements/ButtonLink';
import NotCollectedText from '@/components/elements/NotCollectedText';
import RelativeDateDisplay from '@/components/elements/RelativeDateDisplay';
import { ColumnDef } from '@/components/elements/table/types';
import FilePreviewDialog from '@/components/elements/upload/fileDialog/FilePreviewDialog';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import {
  useClientPermissions,
  useHasClientPermissions,
} from '@/modules/permissions/useHasPermissionsHooks';
import { ClientDashboardRoutes } from '@/routes/routes';
import {
  GetClientFilesDocument,
  GetClientFilesQuery,
  GetClientFilesQueryVariables,
  PickListType,
  useGetPickListQuery,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

type ClientFileType = NonNullable<
  NonNullable<GetClientFilesQuery['client']>['files']
>['nodes'][0];

const FileActions: React.FC<{
  clientId: string;
  file: ClientFileType;
  onDone?: (file: ClientFileType) => any;
  noDownload?: boolean;
}> = ({ clientId, file, onDone = () => {}, noDownload }) => {
  const { getActionsForFile } = useFileActions({
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
        </>
      )}
    </>
  );
};

const ClientFilesPage = () => {
  const { clientId } = useSafeParams() as { clientId: string };
  const [viewingFile, setViewingFile] = useState<ClientFileType | undefined>();

  const [canUpload] = useHasClientPermissions(clientId, [
    'canUploadClientFiles',
  ]);
  const { data: pickListData } = useGetPickListQuery({
    variables: { pickListType: PickListType.AvailableFileTypes },
  });

  const columns: ColumnDef<ClientFileType>[] = useMemo(() => {
    return [
      {
        header: 'File Name',
        render: (file) => (
          <Typography variant='inherit'>{file.name}</Typography>
        ),
        sticky: 'left',
      },
      {
        header: 'File Tags',
        render: (file) =>
          pickListData ? (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {file.tags.map((tag) => {
                const item = pickListData.pickList.find(
                  (type) => type.code === tag
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
        header: 'Project Name',
        render: ({ enrollment }) =>
          enrollment ? (
            enrollment.projectName
          ) : (
            <NotCollectedText>N/A</NotCollectedText>
          ),
      },
      {
        header: 'Uploaded',
        render: ({ dateCreated, uploadedBy }) => {
          const byUser = uploadedBy?.name
            ? `by ${uploadedBy?.name}`
            : 'by unknown user';
          if (dateCreated)
            return (
              <RelativeDateDisplay
                dateString={dateCreated}
                tooltipSuffixText={byUser}
              />
            );
          return `Unknown time ${byUser}`;
        },
      },
    ];
  }, [pickListData]);

  return (
    <>
      <PageTitle
        title='Files'
        actions={
          canUpload && (
            <ButtonLink
              to={generateSafePath(ClientDashboardRoutes.NEW_FILE, {
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
          ClientFileType
        >
          queryVariables={{ id: clientId }}
          queryDocument={GetClientFilesDocument}
          columns={columns}
          rowName={(file) => file.name}
          rowActionTitle='View File'
          hideMenu={(file) => file.redacted}
          handleRowClick={(file) => (file.redacted ? {} : setViewingFile(file))}
          pagePath='client.files'
          noData='No files'
        />
      </Paper>
      {viewingFile && (
        <FilePreviewDialog
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

export default ClientFilesPage;
