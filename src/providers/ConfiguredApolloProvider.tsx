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
import { offsetLimitPagination } from '@apollo/client/utilities';
import fetch from 'cross-fetch';

import * as storage from '@/modules/auth/api/storage';
import { getCsrfToken } from '@/utils/csrf';

const httpLink = createHttpLink({
  uri: import.meta.env.PUBLIC_HMIS_GRAPHQL_API,
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

export const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        clients: offsetLimitPagination(['id']),
      },
    },
  },
});

const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache,
  credentials: 'same-origin',
});

export default ({ children }: { children: React.ReactNode }) => (
  <ApolloProvider client={client}>{children}</ApolloProvider>
);
