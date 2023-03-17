import AddIcon from '@mui/icons-material/Add';
import { Button, Paper, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import { useCallback } from 'react';

import ButtonLink from '@/components/elements/ButtonLink';
import { ColumnDef } from '@/components/elements/GenericTable';
import useSafeParams from '@/hooks/useSafeParams';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { DashboardRoutes } from '@/routes/routes';
import {
  FileFieldsFragment,
  GetClientFilesDocument,
  GetClientFilesQuery,
  GetClientFilesQueryVariables,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const columns: ColumnDef<FileFieldsFragment>[] = [
  {
    header: 'Name',
    render: (e) => e.name,
    linkTreatment: true,
  },
  {
    header: 'Tags',
    render: (e) => e.tags.join(', '),
  },
  {
    header: 'Updated At',
    render: (e) => format(new Date(e.updatedAt), 'MM/dd/yyyy h:mm a'),
  },
  {
    header: 'Updated By',
    render: (e) => e.updatedBy?.name,
  },
  {
    header: 'Actions',
    width: '1%',
    render: (file) => (
      <Stack direction='row' spacing={1} justifyContent='flex-end' flexGrow={1}>
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
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          size='small'
          variant='outlined'
          color='error'
        >
          Delete
        </Button>
      </Stack>
    ),
  },
];

const AllFiles = () => {
  const { clientId } = useSafeParams() as { clientId: string };

  const rowLinkTo = useCallback(
    (file: FileFieldsFragment) =>
      generateSafePath(DashboardRoutes.EDIT_FILE, {
        clientId,
        fileId: file.id,
      }),
    [clientId]
  );

  return (
    <>
      <Stack
        gap={3}
        direction='row'
        justifyContent={'space-between'}
        sx={{ mb: 2, pr: 1, alignItems: 'center' }}
      >
        <Typography variant='h4'>All Files</Typography>
        {/* <ClientPermissionsFilter
          id={clientId}
          permissions={['canViewEnrollmentDetails']}
        > */}
        <ButtonLink
          to={generateSafePath(DashboardRoutes.NEW_FILE, {
            clientId,
          })}
          Icon={AddIcon}
        >
          Add File
        </ButtonLink>
        {/* </ClientPermissionsFilter> */}
      </Stack>
      <Paper>
        <GenericTableWithData<
          GetClientFilesQuery,
          GetClientFilesQueryVariables,
          FileFieldsFragment
        >
          queryVariables={{ id: clientId }}
          queryDocument={GetClientFilesDocument}
          rowLinkTo={rowLinkTo}
          columns={columns}
          pagePath='client.files'
          fetchPolicy='cache-and-network'
        />
      </Paper>
    </>
  );
};

export default AllFiles;
