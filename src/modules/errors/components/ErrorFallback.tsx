import { ApolloError, isApolloError } from '@apollo/client';
import { Alert, AlertTitle, Box, Button, Typography } from '@mui/material';
import { FallbackRender } from '@sentry/react';

import ApolloErrorTrace from './ApolloErrorTrace';

const ErrorFallback = () => (
  <Box
    display='flex'
    justifyContent='center'
    alignItems='center'
    height='100%'
    data-testid='error'
    flexDirection='column'
    sx={{ p: 10 }}
  >
    <Typography variant='h4'>Something went wrong.</Typography>
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
  return (
    <Alert severity='error' sx={{ height: '100%' }}>
      <AlertTitle>An error occurred</AlertTitle>
      {isApolloError(error) && <ApolloErrorTrace error={error} />}
      {!isApolloError(error) && (
        <>
          <Typography variant='body2' sx={{ fontFamily: 'Monospace', my: 2 }}>
            {error.toString()}
          </Typography>
          {import.meta.env.MODE === 'development' &&
            componentStack &&
            componentStack.split('\n').map((s, i) => (
              <Typography
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                variant='caption'
                sx={{ fontFamily: 'Monospace' }}
                display='block'
              >
                {s}
              </Typography>
            ))}
        </>
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
