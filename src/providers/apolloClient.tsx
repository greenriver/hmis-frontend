import { ApolloClient, InMemoryCache, from, ServerError } from '@apollo/client';
import { BatchHttpLink } from '@apollo/client/link/batch-http';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import * as Sentry from '@sentry/react';
import fetch from 'cross-fetch';

import { sentryUser } from '@/modules/auth/api/sessions';
import * as storage from '@/modules/auth/api/storage';
import { getCsrfToken } from '@/utils/csrf';

const batchLink = new BatchHttpLink({
  uri: '/hmis/hmis-gql',
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
const errorLink = onError(({ operation, graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    console.error('[GraphQL error]', graphQLErrors);
    graphQLErrors.forEach(({ message, locations, path }) =>
      Sentry.captureException(new Error(message), {
        extra: {
          query: operation?.query?.loc?.source?.body,
          locations,
          path,
        },
        user: sentryUser(),
      })
    );
  }

  if (networkError) {
    console.error('[Network error]', networkError);
    Sentry.captureException(networkError, { user: sentryUser() });
    if ((networkError as ServerError).statusCode == 401) {
      storage.removeUser();
      location.reload();
    }
  }
});

export const cache = new InMemoryCache({
  typePolicies: {
    // FormDefinition: {
    //   // Singleton types that have no identifying field can use an empty
    //   // array for their keyFields.
    //   keyFields: [],
    // },
  },
});

const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, batchLink]),
  cache,
  credentials: 'same-origin',
});

export default apolloClient;
