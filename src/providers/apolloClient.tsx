import {
  ApolloClient,
  ApolloLink,
  HttpOptions,
  InMemoryCache,
  from,
} from '@apollo/client';
import { BatchHttpLink } from '@apollo/client/link/batch-http';
import { setContext } from '@apollo/client/link/context';
import { RetryLink } from '@apollo/client/link/retry';
import { SentryLink } from 'apollo-link-sentry';
import fetch from 'cross-fetch';
import { generatePath, matchRoutes } from 'react-router-dom';

import { dispatchSessionTrackingEvent } from '../modules/auth/events';
import { HMIS_SESSION_UID_HEADER } from '@/modules/auth/api/constants';
import apolloErrorLink from '@/providers/apolloErrorLink';
import { allRoutes } from '@/routes/routes';
import { getCsrfToken } from '@/utils/csrf';
import { decodeParams } from '@/utils/pathEncoding';

// adds explicit network status code
export class CustomFetchNetworkError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'CustomFetchNetworkError';
  }
}

// https://github.com/apollographql/apollo-feature-requests/issues/153#issuecomment-476832408
const customFetch: HttpOptions['fetch'] = (uri, options) => {
  return fetch(uri, options).then((response) => {
    // For anything over 500, replace the response body with just the status.
    // This gives us cleaner sentry errors because the error will actually say "504" instead of "unable to parse html"
    // For 500 and under, we expect the response to be JSON.
    if (response.status > 500) {
      return Promise.reject(
        new CustomFetchNetworkError(response.status.toString(), response.status)
      );
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

// Add headers to provide more information about the route that the request is coming from
const pathHeaderLink = setContext(
  (
    _,
    { headers }: { headers: { [key: string]: string } }
  ): { headers: Record<string, string> } => {
    const modifiedHeaders: typeof headers = {
      ...headers,
      'X-Hmis-Path': window.location.pathname,
    };

    // Find the Route that matches the current location
    const matches = matchRoutes(allRoutes, window.location);
    if (!matches || matches.length === 0) return { headers: modifiedHeaders };

    const { params, route } = matches[0];
    // Decode params
    const decodedParams = decodeParams(params);
    // Construct path with decoded params, add it to header
    const decodedPath = generatePath(route.path, decodedParams);
    modifiedHeaders['X-Hmis-Path'] = decodedPath; // /client/1/enrollments

    // Add header for applicable params, if present
    const { clientId, enrollmentId, projectId } = decodedParams;
    if (clientId) modifiedHeaders['X-Hmis-Client-Id'] = clientId;
    if (enrollmentId) modifiedHeaders['X-Hmis-Enrollment-Id'] = enrollmentId;
    if (projectId) modifiedHeaders['X-Hmis-Project-Id'] = projectId;
    return { headers: modifiedHeaders };
  }
);

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

const sentryLink = new SentryLink({
  attachBreadcrumbs: {
    includeError: true,
  },
});

export const cache = new InMemoryCache({
  typePolicies: {
    FormDefinition: {
      keyFields: ['cacheKey'],
    },
    ValueBound: { keyFields: false },
    ValidationError: { keyFields: false },
  },
});

const retryLink = new RetryLink({
  delay: {
    initial: 800,
    max: 2400,
    jitter: true,
  },
  attempts: {
    max: 3,
    retryIf: (error: CustomFetchNetworkError, operation) => {
      // Only retry operations that seem to be queries, like "GetWidgets"
      // Avoid retries on mutations as they may not be idempotent
      if (!operation?.operationName?.match(/^(Get)/)) {
        return false;
      }
      switch (error?.statusCode) {
        case 401:
        case 403:
        case 404:
        case 500:
          return false;
      }
      return !!error;
    },
  },
});

const apolloClient = new ApolloClient({
  link: from([
    apolloErrorLink, // handle errors
    sentryLink, // instrument graphql requests for sentry
    retryLink,
    authLink,
    pathHeaderLink,
    sessionExpiryLink,
    batchLink,
  ]),
  cache,
  credentials: 'same-origin',
});

export default apolloClient;
