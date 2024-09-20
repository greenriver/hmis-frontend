import RefreshIcon from '@mui/icons-material/Refresh';
import { LoadingButton } from '@mui/lab';
import React from 'react';
import { useRefreshExternalSubmissionsMutation } from '@/types/gqlTypes';

const RefreshExternalSubmissionsButton = () => {
  const [refresh, { loading: refreshLoading, error: refreshError }] =
    useRefreshExternalSubmissionsMutation();
  if (refreshError) throw refreshError;

  return (
    <LoadingButton
      variant='outlined'
      size='small'
      loading={refreshLoading}
      startIcon={<RefreshIcon />}
      onClick={() => refresh()}
    >
      Refresh
    </LoadingButton>
  );
};

export default RefreshExternalSubmissionsButton;
