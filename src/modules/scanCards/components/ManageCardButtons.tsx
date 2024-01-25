import { LoadingButton } from '@mui/lab';

import {
  DeleteIcon,
  RestoreDeletedIcon,
} from '@/components/elements/SemanticIcons';
import {
  useDeleteScanCardMutation,
  useRestoreScanCardMutation,
} from '@/types/gqlTypes';

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
