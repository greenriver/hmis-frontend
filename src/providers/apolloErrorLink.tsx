import { onError } from '@apollo/client/link/error';
import * as Sentry from '@sentry/react';

import { sentryUser } from '@/modules/auth/api/sessions';
import { dispatchSessionTrackingEvent } from '@/modules/auth/events';
import { isServerError } from '@/modules/errors/util';

/**
 * Handle errors on GraphQL chain.
 *
 * If unauthenticated, triggers event to remove user info from storage and redirect to the login page.
 */

function safeStringify(obj: any) {
  let result: string | undefined = undefined;
  if (!obj) return result;

  try {
    result = JSON.stringify(obj);
  } catch (error) {
    result = undefined;
  }
  return result;
}

const apolloErrorLink = onError(
  ({ operation, graphQLErrors, networkError }) => {
    Sentry.withScope((scope) => {
      scope.setExtra('apolloGraphQLOperation', {
        operationName: operation.operationName,
        // truncate query so as to not exceed Sentry's size limit
        query: safeStringify(
          operation?.query?.loc?.source?.body.slice(0, 1000)
        ),
        // TBD: to capture the input, we'd need to implement scrubPII
        // variables: scrubPII(safeStringify(operation.variables)),
        extensions: safeStringify(operation.extensions),
      });
      scope.setUser(sentryUser() || null);

      let recordedErrors = 0;
      graphQLErrors?.forEach(({ message, locations, path }) => {
        const messageParts = [`message: ${safeStringify(message)}`];
        if (locations)
          messageParts.push(`locations: ${safeStringify(locations)}`);
        if (path) messageParts.push(`path: ${safeStringify(path)}`);
        Sentry.captureMessage(
          `[GraphQL ${operation.operationName}] ${messageParts.join(', ')}`,
          { level: 'error' }
        );
        recordedErrors += 1;
      });

      if (networkError) {
        // Not a server error. This is usually 504 or "Network request failed", track in Sentry
        if (!isServerError(networkError)) {
          if (recordedErrors === 0) Sentry.captureException(networkError);
          return;
        }

        // session may be invalid on the server. No need to send to Sentry.
        if (networkError.statusCode === 401) {
          dispatchSessionTrackingEvent(undefined);
          return;
        }

        if (recordedErrors === 0) {
          Sentry.captureMessage(networkError.message, {
            level: 'error',
            extra: {
              result: networkError.result,
            },
          });
        }
      }
    });
  }
);

export default apolloErrorLink;
