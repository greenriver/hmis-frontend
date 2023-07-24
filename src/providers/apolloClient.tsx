import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  ServerError,
  from,
} from '@apollo/client';
import { BatchHttpLink } from '@apollo/client/link/batch-http';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import * as Sentry from '@sentry/react';
import fetch from 'cross-fetch';

import {
  HMIS_REMOTE_SESSION_UID_EVENT,
  HMIS_SESSION_UID_HEADER,
} from '@/modules/auth/api/constants';
import { sentryUser } from '@/modules/auth/api/sessions';
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

const dispatchSessionTrackingEvent = (userId: string | undefined) => {
  document.dispatchEvent(
    new CustomEvent(HMIS_REMOTE_SESSION_UID_EVENT, { detail: userId })
  );
};

const sessionExpiryLink = new ApolloLink((operation, forward) => {
  return forward(operation).map((response) => {
    const context = operation.getContext();
    const {
      response: { headers },
    } = context;

    if (headers) {
      dispatchSessionTrackingEvent(headers.get(HMIS_SESSION_UID_HEADER));
    }
    return response;
  });
});

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
      // might occur if session was invalidated on the server
      dispatchSessionTrackingEvent(undefined);
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
  link: from([errorLink, authLink, sessionExpiryLink, batchLink]),
  cache,
  credentials: 'same-origin',
});

export default apolloClient;
