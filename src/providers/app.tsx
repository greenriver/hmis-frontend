import { ApolloProvider } from '@apollo/client';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import * as Sentry from '@sentry/react';
import * as React from 'react';
import { BrowserRouter } from 'react-router-dom';

import apolloClient from './apolloClient';

import { fullPageErrorFallback } from '@/components/elements/ErrorFallback';
import Loading from '@/components/elements/Loading';
import MergedThemeProvider from '@/config/MergedThemeProvider';
import { AuthProvider } from '@/modules/auth/hooks/useAuth';

type AppProviderProps = {
  children: React.ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <React.Suspense fallback={<Loading />}>
      <Sentry.ErrorBoundary fallback={fullPageErrorFallback}>
        <MergedThemeProvider>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <ApolloProvider client={apolloClient}>
              <BrowserRouter>
                <AuthProvider>{children}</AuthProvider>
              </BrowserRouter>
            </ApolloProvider>
          </LocalizationProvider>
        </MergedThemeProvider>
      </Sentry.ErrorBoundary>
    </React.Suspense>
  );
};
