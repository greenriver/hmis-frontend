import {
  ApolloClient,
  InMemoryCache,
  // ApolloProvider,
  createHttpLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { MockedProvider } from '@apollo/client/testing';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import fetch from 'cross-fetch';
import * as React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { BrowserRouter } from 'react-router-dom';

import Loading from '@/components/elements/Loading';
import muiTheme from '@/config/theme';
import { AuthProvider } from '@/modules/auth/hooks/useAuth';
import mocks from '@/test/__mocks__/requests';
import { getCsrfToken } from '@/utils/csrf';

const httpLink = createHttpLink({
  uri: '/hmis-api/hmis-gql',
  fetch,
});

const authLink = setContext(
  (
    _,
    { headers }: { headers: { [key: string]: string } }
  ): { headers: Record<string, string> } => {
    return {
      headers: {
        ...headers,
        'X-CSRF-Token': getCsrfToken(),
      },
    };
  }
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  credentials: 'same-origin',
});

const ErrorFallback = () => {
  return (
    <div role='alert'>
      <h2>Oops, something went wrong.</h2>
      <button onClick={() => window.location.assign(window.location.origin)}>
        Refresh
      </button>
    </div>
  );
};

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
            {/* <ApolloProvider client={client}> */}
            <MockedProvider mocks={mocks} addTypename={false}>
              <BrowserRouter>
                <AuthProvider>{children}</AuthProvider>
              </BrowserRouter>
              {/* </ApolloProvider> */}
            </MockedProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </React.Suspense>
  );
};
