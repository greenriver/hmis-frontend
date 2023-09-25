import { ApolloError } from '@apollo/client';
import {
  Alert,
  AlertProps,
  AlertTitle,
  Box,
  Button,
  Snackbar,
} from '@mui/material';

import { GraphQLError } from 'graphql';
import { forwardRef, useEffect, useMemo, useState } from 'react';

import { isServerError, UNKNOWN_ERROR_HEADING } from '../util';
import ApolloErrorTrace from './ApolloErrorTrace';

interface Props2 {
  graphqlErrors: GraphQLError[];
  alertProps?: AlertProps;
  retry?: VoidFunction;
}

const BaseAlert = forwardRef<Props2, any>(
  ({ alertProps, retry, graphqlErrors }, ref) => {
    return (
      <Alert severity='error' {...alertProps} ref={ref}>
        <AlertTitle sx={{ mb: 0 }}>
          {graphqlErrors[0]?.message || UNKNOWN_ERROR_HEADING}
        </AlertTitle>
        <ApolloErrorTrace graphqlErrors={graphqlErrors} />
        {import.meta.env.MODE === 'development' && retry && (
          <Box>
            <Button size='small' sx={{ my: 2 }} onClick={retry}>
              Retry
            </Button>
          </Box>
        )}
      </Alert>
    );
  }
);

const SnackbarAlert: React.FC<Props2> = ({
  graphqlErrors,
  alertProps = {},
  ...props
}) => {
  const [counter, setCounter] = useState(0);
  const handleClose = () => {
    setCounter(0);
  };

  useEffect(() => {
    setCounter((c) => c + 1);
  }, [graphqlErrors]);

  return (
    <Snackbar
      open={counter > 0}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={({ shadows }) => ({ boxShadow: shadows[2] })}
    >
      <BaseAlert
        graphqlErrors={graphqlErrors}
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
  const graphqlErrors = useMemo<GraphQLError[]>(() => {
    if (!error) return [];
    if (error.graphQLErrors.length < 1 && isServerError(error.networkError)) {
      return error.networkError?.result?.errors || [];
    }
    return [...error.graphQLErrors];
  }, [error]);

  if (!error) return;

  if (inline) {
    return <BaseAlert {...props} graphqlErrors={graphqlErrors} />;
  }
  return <SnackbarAlert {...props} graphqlErrors={graphqlErrors} />;
};

export default ApolloErrorAlert;
