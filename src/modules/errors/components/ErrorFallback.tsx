import { ApolloError, isApolloError } from '@apollo/client';
import { Alert, AlertTitle, Box, Button, Typography } from '@mui/material';
import { FallbackRender } from '@sentry/react';

import { NotFoundError, UNKNOWN_ERROR_HEADING } from '../util';

import ApolloErrorAlert from './ApolloErrorAlert';
import SentryErrorTrace from './SentryErrorTrace';

const ErrorFallback = ({
  text = 'Something went wrong.',
}: {
  text?: string;
}) => (
  <Box
    display='flex'
    justifyContent='center'
    alignItems='center'
    height='100%'
    data-testid='error'
    flexDirection='column'
    sx={{ p: 10 }}
  >
    <Typography variant='h4'>{text}</Typography>
  </Box>
);

export const alertErrorFallback: FallbackRender = ({
  error,
  componentStack,
  resetError,
}: {
  error: Error | ApolloError;
  componentStack: string | null;
  eventId: string | null;
  resetError(): void;
}) => {
  if (isApolloError(error)) {
    return (
      <ApolloErrorAlert
        error={error}
        AlertProps={{ sx: { height: '100%' } }}
        retry={() => resetError()}
      />
    );
  }

  return (
    <Alert severity='error' sx={{ height: '100%' }}>
      <AlertTitle>
        {error instanceof NotFoundError
          ? 'Page not found'
          : UNKNOWN_ERROR_HEADING}
      </AlertTitle>
      {!isApolloError(error) && import.meta.env.MODE === 'development' && (
        <SentryErrorTrace error={error} componentStack={componentStack} />
      )}
      {import.meta.env.MODE === 'development' && (
        <Box>
          <Button size='small' sx={{ my: 2 }} onClick={() => resetError()}>
            Retry
          </Button>
        </Box>
      )}
    </Alert>
  );
};

export const fullPageErrorFallback: FallbackRender = (args) => {
  if (import.meta.env.MODE !== 'development') {
    return <ErrorFallback />;
  }
  return alertErrorFallback(args);
};

export default ErrorFallback;
