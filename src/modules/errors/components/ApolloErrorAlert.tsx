import { ApolloError } from '@apollo/client';
import {
  Alert,
  AlertProps,
  AlertTitle,
  Box,
  Button,
  Snackbar,
} from '@mui/material';
import isString from 'lodash-es/isString';

import { forwardRef, useEffect, useMemo, useState } from 'react';

import { isServerError, UNKNOWN_ERROR_HEADING } from '../util';
import ApolloErrorTrace from './ApolloErrorTrace';

const showDeveloperInfo = import.meta.env.MODE === 'development';

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
        <Box sx={{ mt: 2 }} textAlign='center'>
          {showDeveloperInfo && retry && (
            <Button size='small' sx={{ mr: 2 }} onClick={retry} variant='text'>
              Retry
            </Button>
          )}
          <Button
            size='small'
            variant='text'
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
      sx={({ shadows }) => ({
        boxShadow: shadows[4],
        borderRadius: 2,
        '.MuiAlertTitle-root': { fontWeight: 600 },
        marginTop: '100px',
      })}
    >
      <BaseAlert
        errors={errors}
        alertProps={{
          ...alertProps,
          onClose: handleClose,
          variant: 'standard',
        }}
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
  const displayErrors = useMemo<Error[]>(() => {
    if (!error) return [];
    if (isServerError(error.networkError)) {
      // looks like this maybe an array sometimes. Maybe related to batching
      const result = error.networkError?.result;
      if (Array.isArray(result)) {
        return result[0]?.errors || [];
      }
      return isString(result) ? [result] : result?.errors || [];
    }
    // don't show graphql errors to user in prod
    if (showDeveloperInfo) {
      return error.graphQLErrors;
    }
    return [];
  }, [error]);

  const isNetworkError = error
    ? error.graphQLErrors?.length === 0 && !isServerError(error.networkError)
    : false;
  if (!error) return;

  if (inline) {
    return (
      <BaseAlert
        {...props}
        errors={displayErrors || []}
        isNetworkError={isNetworkError}
      />
    );
  }
  return (
    <SnackbarAlert
      {...props}
      errors={displayErrors || []}
      isNetworkError={isNetworkError}
    />
  );
};

export default ApolloErrorAlert;
