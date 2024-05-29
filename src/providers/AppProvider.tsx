import { ApolloProvider } from '@apollo/client';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import en from 'date-fns/locale/en-US';
import * as React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import apolloClient from './apolloClient';

import Loading from '@/components/elements/Loading';
import MergedThemeProvider from '@/config/MergedThemeProvider';
import SentryErrorBoundary from '@/modules/errors/components/SentryErrorBoundary';
import { HmisAppSettingsProvider } from '@/modules/hmisAppSettings/Provider';
import { protectedRoutes } from '@/routes/protected';

const router = createBrowserRouter(protectedRoutes); // TODO - fix this

const AppProvider = () => {
  return (
    <React.Suspense fallback={<Loading />}>
      <SentryErrorBoundary>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={en}>
          <ApolloProvider client={apolloClient}>
            <HmisAppSettingsProvider>
              <MergedThemeProvider>
                <RouterProvider router={router} />
              </MergedThemeProvider>
            </HmisAppSettingsProvider>
          </ApolloProvider>
        </LocalizationProvider>
      </SentryErrorBoundary>
    </React.Suspense>
  );
};
export default AppProvider;
