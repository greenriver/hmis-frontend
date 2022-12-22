import { ApolloError, ServerError, ServerParseError } from '@apollo/client';
import { Box, Typography, Button, Alert, AlertTitle } from '@mui/material';
import { FallbackRender } from '@sentry/react';
import { GraphQLError } from 'graphql';

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

const isApolloError = (err: Error | ApolloError): err is ApolloError => {
  return !!(err instanceof Error && err.hasOwnProperty('graphQLErrors'));
};

const isServerError = (
  err: Error | ServerParseError | ServerError | null
): err is ServerError => {
  return !!(err && err instanceof Error && err.hasOwnProperty('result'));
};

export const ApolloErrorTrace = ({ error }: { error: ApolloError }) => {
  let graphQLErrors = error.graphQLErrors;
  if (graphQLErrors.length < 1 && isServerError(error.networkError)) {
    graphQLErrors = error.networkError?.result?.errors || [];
  }

  return (
    <>
      {graphQLErrors.map((e) => (
        <>
          <Typography variant='body2' sx={{ fontFamily: 'Monospace', my: 2 }}>
            {e.message}
          </Typography>
          {import.meta.env.MODE === 'development' &&
            (
              (e as GraphQLError & { backtrace: string[] })?.backtrace || []
            ).map((line) => (
              <Typography
                variant='caption'
                sx={{ fontFamily: 'Monospace', display: 'block' }}
              >
                {line}
              </Typography>
            ))}
        </>
      ))}
    </>
  );
};

export const ApolloErrorAlert = ({ error }: { error?: ApolloError }) => (
  <Alert severity='error'>
    <AlertTitle>An error occurred.</AlertTitle>
    {error && <ApolloErrorTrace error={error} />}
  </Alert>
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
            componentStack.split('\n').map((s) => (
              <Typography
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
