import UploadIcon from '@mui/icons-material/Upload';
import { Box, Chip, Paper, Typography } from '@mui/material';
import { useMemo, useState } from 'react';

import useFileActions from '../hooks/useFileActions';

import ButtonLink from '@/components/elements/ButtonLink';
import NotCollectedText from '@/components/elements/NotCollectedText';
import RelativeDateDisplay from '@/components/elements/RelativeDateDisplay';
import FilePreviewDialog from '@/components/elements/upload/fileDialog/FilePreviewDialog';
import PageTitle from '@/components/layout/PageTitle';
import { useIsMobile } from '@/hooks/useIsMobile';
import useSafeParams from '@/hooks/useSafeParams';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { DataColumnDef } from '@/modules/dataFetching/types';
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

  const isTiny = useIsMobile('sm');

  const columns: DataColumnDef<ClientFileType, GetClientFilesQueryVariables>[] =
    useMemo(() => {
      return [
        {
          header: 'File Name',
          key: 'fileName',
          render: (file) => (
            <Typography variant='inherit'>{file.name}</Typography>
          ),
          // Limit the col width on tiny screens so that other non-sticky columns are scrollable
          maxWidth: isTiny ? '100px' : undefined,
          sticky: 'left',
        },
        {
          header: 'File Tags',
          key: 'tags',
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
          key: 'projectName',
          render: ({ enrollment }) =>
            enrollment ? (
              enrollment.projectName
            ) : (
              <NotCollectedText>N/A</NotCollectedText>
            ),
        },
        {
          header: 'Uploaded',
          key: 'uploaded',
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
        {
          header: 'Organization Name',
          key: 'organizationName',
          optional: {
            defaultHidden: true,
            queryVariableField: 'includeOrganizationName',
          },
          render: (file) => {
            if (file.enrollment) {
              return file.enrollment.organizationName;
            }
          },
        },
      ];
    }, [isTiny, pickListData]);

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
