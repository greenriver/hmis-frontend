import { ApolloProvider } from '@apollo/client';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import * as React from 'react';
import { BrowserRouter } from 'react-router-dom';

import apolloClient from './apolloClient';

import Loading from '@/components/elements/Loading';
import MergedThemeProvider from '@/config/MergedThemeProvider';
import { AuthProvider } from '@/modules/auth/hooks/useAuth';
import SentryErrorBoundary from '@/modules/errors/components/SentryErrorBoundary';
import { HmisAppSettingsProvider } from '@/modules/hmisAppSettings/Provider';

type AppProviderProps = {
  children: React.ReactNode;
};

const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <React.Suspense fallback={<Loading />}>
      <SentryErrorBoundary fullpage>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <ApolloProvider client={apolloClient}>
            <BrowserRouter>
              <HmisAppSettingsProvider>
                <MergedThemeProvider>
                  <AuthProvider>{children}</AuthProvider>
                </MergedThemeProvider>
              </HmisAppSettingsProvider>
            </BrowserRouter>
          </ApolloProvider>
        </LocalizationProvider>
      </SentryErrorBoundary>
    </React.Suspense>
  );
};
export default AppProvider;
