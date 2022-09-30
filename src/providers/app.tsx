import { ApolloProvider } from '@apollo/client';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import * as React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { BrowserRouter } from 'react-router-dom';

import apolloClient from './apolloClient';

import ErrorFallback from '@/components/elements/ErrorFallback';
import Loading from '@/components/elements/Loading';
import theme from '@/config/theme';
import { AuthProvider } from '@/modules/auth/hooks/useAuth';

type AppProviderProps = {
  children: React.ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <React.Suspense fallback={<Loading />}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <ApolloProvider client={apolloClient}>
              <BrowserRouter>
                <AuthProvider>{children}</AuthProvider>
              </BrowserRouter>
            </ApolloProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </React.Suspense>
  );
};
