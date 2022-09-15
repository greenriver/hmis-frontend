import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { Box, CircularProgress, Stack } from '@mui/material';
import { ReactNode } from 'react';

const InputIndicatorContainer = ({
  children,
  loading,
  error,
  success,
}: {
  children: ReactNode;
  loading?: boolean;
  error?: boolean;
  success?: boolean;
}) => {
  let indicator = null;
  if (loading) {
    indicator = <CircularProgress size='1.2em' />;
  } else if (error) {
    indicator = <ErrorIcon fontSize='small' color='error' />;
  } else if (success) {
    indicator = <CheckCircleIcon fontSize='small' color='success' />;
  }

  return (
    <Stack direction='row' spacing={1}>
      <Box
        width={24}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {indicator}
      </Box>
      {children}
    </Stack>
  );
};

export default InputIndicatorContainer;
