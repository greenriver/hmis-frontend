import { ApolloError, isApolloError } from '@apollo/client';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Container,
  Typography,
} from '@mui/material';
import { FallbackRender } from '@sentry/react';

import { NotFoundError, UNKNOWN_ERROR_HEADING } from '../util';

import ApolloErrorAlert from './ApolloErrorAlert';
import SentryErrorTrace from './SentryErrorTrace';

const ErrorFallback = ({ text = UNKNOWN_ERROR_HEADING }: { text?: string }) => (
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
        alertProps={{ sx: { height: '100%' } }}
        retry={() => resetError()}
        inline
      />
    );
  }

  return (
    <Container>
      <Alert severity='error' sx={{ my: 2 }}>
        <AlertTitle sx={{ fontWeight: 400 }}>
          {error instanceof NotFoundError
            ? 'Page not found'
            : UNKNOWN_ERROR_HEADING}
        </AlertTitle>
        {!isApolloError(error) && import.meta.env.MODE === 'development' && (
          <SentryErrorTrace error={error} componentStack={componentStack} />
        )}
        <Box sx={{ mt: 2 }}>
          {import.meta.env.MODE === 'development' && (
            <Button
              variant='outlined'
              size='small'
              sx={{ mr: 2, background: '#fff' }}
              onClick={() => resetError()}
            >
              Retry
            </Button>
          )}
          <Button
            variant='outlined'
            size='small'
            sx={{ background: '#fff' }}
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </Box>
      </Alert>
    </Container>
  );
};

export const fullPageErrorFallback: FallbackRender = (args) => {
  if (import.meta.env.MODE !== 'development') {
    return <ErrorFallback />;
  }
  return alertErrorFallback(args);
};

export default ErrorFallback;
