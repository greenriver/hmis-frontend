import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import fetch from 'cross-fetch';
import * as React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { BrowserRouter } from 'react-router-dom';

import Loading from '@/components/elements/Loading';
import { AuthProvider } from '@/modules/auth/hooks/useAuth';
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

const theme = createTheme();

type AppProviderProps = {
  children: React.ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <React.Suspense fallback={<Loading />}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ThemeProvider theme={theme}>
          <ApolloProvider client={client}>
            <BrowserRouter>
              <AuthProvider>{children}</AuthProvider>
            </BrowserRouter>
          </ApolloProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </React.Suspense>
  );
};
