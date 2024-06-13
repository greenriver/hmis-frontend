import { isApolloError } from '@apollo/client';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Container,
  Typography,
} from '@mui/material';
import { FallbackRender } from '@sentry/react';

import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { NotFoundError, UNKNOWN_ERROR_HEADING } from '../util';

import ApolloErrorAlert from './ApolloErrorAlert';
import SentryErrorTrace from './SentryErrorTrace';

export const FullPageError: React.FC<{
  text?: string;
}> = ({ text = UNKNOWN_ERROR_HEADING }) => (
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

interface Props extends Omit<Parameters<FallbackRender>[0], 'error'> {
  error?: any;
}

export const AlertErrorFallback: React.FC<Props> = ({
  error,
  componentStack,
  resetError,
}) => {
  const { pathname } = useLocation();
  const originalPathname = useRef(pathname);

  // Reset error boundary when navigated away
  useEffect(() => {
    if (pathname !== originalPathname.current) {
      resetError();
    }
  }, [pathname, resetError]);

  if (error && isApolloError(error)) {
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
