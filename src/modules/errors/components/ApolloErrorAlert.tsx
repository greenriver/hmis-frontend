import { ApolloError } from '@apollo/client';
import {
  Alert,
  AlertProps,
  AlertTitle,
  Box,
  Button,
  Snackbar,
} from '@mui/material';

import { forwardRef, useEffect, useMemo, useState } from 'react';

import { isServerError, UNKNOWN_ERROR_HEADING } from '../util';
import ApolloErrorTrace from './ApolloErrorTrace';

interface BaseAlertProps {
  errors: Error[];
  isNetworkError: boolean;
  alertProps?: AlertProps;
  retry?: VoidFunction;
}

const BaseAlert = forwardRef<HTMLDivElement, BaseAlertProps>(
  ({ alertProps, retry, errors, isNetworkError }, ref) => {
    let errorMessage = '';
    if (isNetworkError) {
      errorMessage = `There was a problem connecting to the network. Please reload the page and try again.`;
    } else {
      errorMessage = errors[0]?.message || UNKNOWN_ERROR_HEADING;
    }

    return (
      <Alert severity='error' {...alertProps} ref={ref}>
        <AlertTitle sx={{ mb: 0 }}>{errorMessage}</AlertTitle>
        <ApolloErrorTrace errors={errors} />
        <Box sx={{ mt: 2 }}>
          {import.meta.env.MODE === 'development' && retry && (
            <Button
              size='small'
              sx={{ ml: 2 }}
              onClick={retry}
              variant='outlined'
            >
              Retry
            </Button>
          )}
          <Button
            size='small'
            variant='outlined'
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </Box>
      </Alert>
    );
  }
);

const SnackbarAlert: React.FC<BaseAlertProps> = ({
  errors,
  alertProps = {},
  ...props
}) => {
  const [counter, setCounter] = useState(0);
  const handleClose = () => {
    setCounter(0);
  };

  useEffect(() => {
    setCounter((c) => c + 1);
  }, [errors]);

  return (
    <Snackbar
      open={counter > 0}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={({ shadows }) => ({ boxShadow: shadows[2] })}
    >
      <BaseAlert
        errors={errors}
        alertProps={{ ...alertProps, onClose: handleClose, variant: 'filled' }}
        {...props}
      />
    </Snackbar>
  );
};

interface Props {
  error?: ApolloError;
  alertProps?: AlertProps;
  retry?: VoidFunction;
  inline?: boolean;
}
const ApolloErrorAlert: React.FC<Props> = ({
  error,
  inline = false,
  ...props
}) => {
  const errors = useMemo<Error[]>(() => {
    if (!error) return [];
    if (error.graphQLErrors?.length == 0 && isServerError(error.networkError)) {
      return error.networkError?.result[0]?.errors || [];
    }
    return error.graphQLErrors;
  }, [error]);

  const isNetworkError = error
    ? error.graphQLErrors?.length == 0 && !isServerError(error.networkError)
    : false;
  if (!error) return;

  if (inline) {
    return (
      <BaseAlert
        {...props}
        errors={errors || []}
        isNetworkError={isNetworkError}
      />
    );
  }
  return (
    <SnackbarAlert
      {...props}
      errors={errors || []}
      isNetworkError={isNetworkError}
    />
  );
};

export default ApolloErrorAlert;
