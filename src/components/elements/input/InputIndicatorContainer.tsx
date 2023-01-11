import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { Box, CircularProgress, Stack } from '@mui/material';
import { ReactNode, useEffect, useState } from 'react';

const InputIndicatorContainer = ({
  children,
  loading,
  error,
  success,
  position = 'left',
  showSuccessDuration = 3000,
}: {
  children: ReactNode;
  loading?: boolean;
  error?: boolean;
  success?: boolean;
  position?: 'left' | 'right';
  showSuccessDuration?: number;
}) => {
  const [showCheckmark, setShowCheckmark] = useState(false);

  // Hide "completed" checkmark after a few seconds
  useEffect(() => {
    console.log('useEffect', success);
    if (!success) return;
    setShowCheckmark(true);
    const timer = setTimeout(function () {
      setShowCheckmark(false);
    }, showSuccessDuration);

    return () => clearTimeout(timer);
  }, [success, showSuccessDuration]);

  let indicator = null;
  if (loading) {
    indicator = <CircularProgress size='1.2em' />;
  } else if (error) {
    indicator = <ErrorIcon fontSize='small' color='error' />;
  } else if (showCheckmark) {
    indicator = <CheckCircleIcon fontSize='small' color='success' />;
  }

  const indicatorComponent = (
    <Box
      width={24}
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {indicator}
    </Box>
  );

  return (
    <Stack direction='row' spacing={1}>
      {position === 'left' ? indicatorComponent : null}
      {children}
      {position === 'right' ? indicatorComponent : null}
    </Stack>
  );
};

export default InputIndicatorContainer;
