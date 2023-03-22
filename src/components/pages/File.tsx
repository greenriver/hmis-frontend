import { Stack, Typography } from '@mui/material';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Loading from '../elements/Loading';

import useSafeParams from '@/hooks/useSafeParams';
import EditRecord from '@/modules/form/components/EditRecord';
import { cache } from '@/providers/apolloClient';
import { DashboardRoutes } from '@/routes/routes';
import {
  FormRole,
  FileFieldsFragment,
  useGetFileQuery,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const File = ({ create = false }: { create?: boolean }) => {
  const navigate = useNavigate();
  const { clientId, fileId } = useSafeParams() as {
    fileId: string;
    clientId: string;
  };
  const title = create ? `Upload File` : `Edit File`;

  const onCompleted = useCallback(() => {
    // Force refresh table if we just created a new record
    if (create) {
      cache.evict({ id: `Client:${clientId}`, fieldName: 'files' });
    }
    navigate(
      generateSafePath(DashboardRoutes.FILES, {
        clientId,
      })
    );
  }, [navigate, clientId, create]);

  const { data, loading, error } = useGetFileQuery({
    variables: { id: fileId },
    skip: create,
  });

  if (loading) return <Loading />;
  // if (crumbsLoading) return <Loading />
  if (error) throw error;
  if (!create && !loading && !data?.file) throw Error('File not found');

  return (
    <EditRecord<FileFieldsFragment>
      formRole={FormRole.File}
      onCompleted={onCompleted}
      record={data?.file || undefined}
      localConstants={{ fileId: data?.file?.id }}
      inputVariables={{ clientId }}
      FormActionProps={create ? { submitButtonText: 'Upload File' } : undefined}
      pickListRelationId={clientId}
      title={
        <Stack direction={'row'} spacing={2}>
          <Typography variant='h3' sx={{ pt: 0, mt: 0 }}>
            {title}
          </Typography>
        </Stack>
      }
    />
  );
};
export default File;
