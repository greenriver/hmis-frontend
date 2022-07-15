import { MockedProvider } from '@apollo/client/testing';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import * as React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { BrowserRouter } from 'react-router-dom';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import ConfiguredApolloProvider, { cache } from './ConfiguredApolloProvider';

import ErrorFallback from '@/components/elements/ErrorFallback';
import Loading from '@/components/elements/Loading';
import muiTheme from '@/config/theme';
import { AuthProvider } from '@/modules/auth/hooks/useAuth';
import mocks from '@/test/__mocks__/requests';

const theme = createTheme(muiTheme);

type AppProviderProps = {
  children: React.ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <React.Suspense fallback={<Loading />}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <MockedProvider mocks={mocks} addTypename={false}>
              {/* <ConfiguredApolloProvider> */}
              <BrowserRouter>
                <AuthProvider>{children}</AuthProvider>
              </BrowserRouter>
              {/* </ConfiguredApolloProvider> */}
            </MockedProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </React.Suspense>
  );
};
