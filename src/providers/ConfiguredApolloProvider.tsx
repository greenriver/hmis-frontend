import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  from,
  createHttpLink,
  ServerError,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import fetch from 'cross-fetch';

import * as storage from '@/modules/auth/api/storage';
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

/**
 * Handle errors on GraphQL chain.
 *
 * If unauthenticated, remove user info from storage and redirect to the login page.
 *
 * Note this doesn't work in all cases, sometimes backend is returning.
 * 500 or 422 when unauthenticated. fix with #182653885
 */
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) console.log('[GraphQL error]', graphQLErrors);

  if (networkError) {
    console.log('[Network error]', networkError);
    if ((networkError as ServerError).statusCode == 401) {
      storage.removeUser();
      location.reload();
    }
  }
});

const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  credentials: 'same-origin',
});

export default ({ children }: { children: React.ReactNode }) => (
  <ApolloProvider client={client}>{children}</ApolloProvider>
);
