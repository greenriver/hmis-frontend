import RefreshIcon from '@mui/icons-material/Refresh';
import { LoadingButton } from '@mui/lab';
import React from 'react';
import {
  GetProjectExternalFormSubmissionsDocument,
  useRefreshExternalSubmissionsMutation,
} from '@/types/gqlTypes';

const RefreshExternalSubmissionsButton = () => {
  const [refresh, { loading: refreshLoading, error: refreshError }] =
    useRefreshExternalSubmissionsMutation({
      refetchQueries: [GetProjectExternalFormSubmissionsDocument],
      awaitRefetchQueries: true,
    });
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
