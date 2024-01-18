import { LoadingButton } from '@mui/lab';
import {
  DeleteIcon,
  RestoreDeletedIcon,
  ScanCardIcon,
} from '@/components/elements/SemanticIcons';
import { cache } from '@/providers/apolloClient';
import {
  useCreateScanCardMutation,
  useDeleteScanCardMutation,
  useRestoreScanCardMutation,
} from '@/types/gqlTypes';

export const GenerateScanCardButton: React.FC<{
  clientId: string;
}> = ({ clientId }) => {
  const [mutate, { loading, error }] = useCreateScanCardMutation({
    variables: { clientId },
    onCompleted: (data) => {
      if (data.createScanCardCode?.scanCardCode) {
        cache.evict({
          id: `Client:${clientId}`,
          fieldName: 'scanCardCodes',
        });
      }
    },
  });

  if (error) throw error;

  return (
    <LoadingButton
      startIcon={<ScanCardIcon />}
      variant='outlined'
      loading={loading}
      onClick={() => mutate()}
    >
      Generate Scan Card
    </LoadingButton>
  );
};

export const DeactivateScanCardButton: React.FC<{
  id: string;
}> = ({ id }) => {
  const [mutate, { loading, error }] = useDeleteScanCardMutation({
    variables: { id },
  });

  if (error) throw error;

  return (
    <LoadingButton
      startIcon={<DeleteIcon />}
      size='small'
      variant='outlined'
      color='error'
      loading={loading}
      onClick={() => mutate()}
    >
      Deactivate
    </LoadingButton>
  );
};

export const RestoreScanCardButton: React.FC<{
  id: string;
}> = ({ id }) => {
  const [mutate, { loading, error }] = useRestoreScanCardMutation({
    variables: { id },
  });

  if (error) throw error;

  return (
    <LoadingButton
      startIcon={<RestoreDeletedIcon />}
      size='small'
      variant='outlined'
      color='info'
      loading={loading}
      onClick={() => mutate()}
    >
      Restore
    </LoadingButton>
  );
};
