import {
  ApolloClient,
  ApolloLink,
  HttpOptions,
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
import { isServerError } from '@/modules/errors/util';
import { getCsrfToken } from '@/utils/csrf';

// https://github.com/apollographql/apollo-feature-requests/issues/153#issuecomment-476832408
const customFetch: HttpOptions['fetch'] = (uri, options) => {
  return fetch(uri, options).then((response) => {
    // For anything over 500, replace the response body with just the status.
    // This gives us cleaner sentry errors because the error will actually say "504" instead of "unable to parse html"
    // For 500 and under, we expect the response to be JSON.
    if (response.status > 500) {
      return Promise.reject(new Error(response.status.toString()));
    }
    return response;
  });
};

const batchLink = new BatchHttpLink({
  uri: '/hmis/hmis-gql',
  fetch: customFetch,
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
    if (isServerError(networkError)) {
      const { statusCode, result } = networkError;
      console.error('[Server error]', statusCode, result);
      Sentry.captureException(statusCode, {
        user: sentryUser(),
        extra: { result },
      });
    } else {
      console.error('[Network error]', networkError);
      Sentry.captureException(networkError, { user: sentryUser() });
    }

    if ((networkError as ServerError).statusCode == 401) {
      // might occur if session was invalidated on the server
      dispatchSessionTrackingEvent(undefined);
    }
  }
});

export const cache = new InMemoryCache({
  typePolicies: {
    FormDefinition: {
      keyFields: ['cacheKey'],
    },
  },
});

const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, sessionExpiryLink, batchLink]),
  cache,
  credentials: 'same-origin',
});

export default apolloClient;
