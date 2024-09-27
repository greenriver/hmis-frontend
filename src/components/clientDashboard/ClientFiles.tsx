import UploadIcon from '@mui/icons-material/Upload';
import { Box, Chip, Link, Paper, Stack, Typography } from '@mui/material';
import { useMemo, useState } from 'react';

import NotCollectedText from '../elements/NotCollectedText';
import PageTitle from '../layout/PageTitle';

import FileDialog from './files/FileModal';
import useFileActions from './files/useFileActions';

import { ClientDashboardRoutes } from '@/app/routes';
import ButtonLink from '@/components/elements/ButtonLink';
import { ColumnDef } from '@/components/elements/table/types';
import useSafeParams from '@/hooks/useSafeParams';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import EnrollmentDateRangeWithStatus from '@/modules/hmis/components/EnrollmentDateRangeWithStatus';
import { parseAndFormatDateTime } from '@/modules/hmis/hmisUtil';
import {
  useClientPermissions,
  useHasClientPermissions,
} from '@/modules/permissions/useHasPermissionsHooks';
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

const ClientFiles = () => {
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
        render: (file) =>
          file.redacted ? (
            <Typography variant='inherit'>{file.name}</Typography>
          ) : (
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
        header: 'Enrollment',
        render: ({ enrollment }) => {
          if (!enrollment) return <NotCollectedText>N/A</NotCollectedText>;

          return (
            <Stack gap={1}>
              {enrollment.projectName}
              <EnrollmentDateRangeWithStatus enrollment={enrollment} />
            </Stack>
          );
        },
      },
      {
        header: 'Uploaded At',
        render: (file) => {
          const uploadedAt = file.dateCreated
            ? parseAndFormatDateTime(file.dateCreated)
            : 'Unknown time';
          const uploadedBy = file.uploadedBy?.name
            ? `by ${file.uploadedBy?.name}`
            : 'by unknown user';
          return `${uploadedAt} ${uploadedBy}`;
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
          pagePath='client.files'
          handleRowClick={(file) => !file.redacted && setViewingFile(file)}
          noData='No files'
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

export default ClientFiles;
