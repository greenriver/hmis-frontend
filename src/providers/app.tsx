import { ApolloProvider } from '@apollo/client';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import * as Sentry from '@sentry/react';
import * as React from 'react';
import { BrowserRouter } from 'react-router-dom';

import apolloClient from './apolloClient';

import Loading from '@/components/elements/Loading';
import MergedThemeProvider from '@/config/MergedThemeProvider';
import { AuthProvider } from '@/modules/auth/hooks/useAuth';
import { fullPageErrorFallback } from '@/modules/errors/components/ErrorFallback';
import { HmisAppSettingsProvider } from '@/modules/hmisAppSettings/Provider';

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
                <HmisAppSettingsProvider>
                  <AuthProvider>{children}</AuthProvider>
                </HmisAppSettingsProvider>
              </BrowserRouter>
            </ApolloProvider>
          </LocalizationProvider>
        </MergedThemeProvider>
      </Sentry.ErrorBoundary>
    </React.Suspense>
  );
};
