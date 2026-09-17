import { ApolloLink, execute, gql, Observable } from '@apollo/client';
import * as Sentry from '@sentry/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@sentry/react', () => ({
  withScope: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));
vi.mock('@/modules/auth/api/sessions', () => ({
  sentryUser: () => undefined,
}));
vi.mock('@/modules/auth/events', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/modules/auth/events')>()),
  dispatchAccountErrorEvent: vi.fn(),
  dispatchSessionTrackingEvent: vi.fn(),
}));

import apolloErrorLink from './apolloErrorLink';
import {
  dispatchAccountErrorEvent,
  dispatchSessionTrackingEvent,
} from '@/modules/auth/events';
const withScope = Sentry.withScope as ReturnType<typeof vi.fn>;

const query = gql`
  query Test {
    test
  }
`;

// Apollo's ServerError: an Error carrying the HTTP status and parsed body.
const serverError = (statusCode: number, result: unknown) =>
  Object.assign(new Error(`HTTP ${statusCode}`), {
    statusCode,
    result,
    response: {},
  });

// Runs the error link ahead of a terminating link that fails with `networkError`.
const runWithNetworkError = (networkError: Error) =>
  new Promise<void>((resolve) => {
    const failing = new ApolloLink(
      () => new Observable((observer) => observer.error(networkError))
    );
    execute(apolloErrorLink.concat(failing), { query }).subscribe({
      error: () => resolve(),
    });
  });

describe('apolloErrorLink', () => {
  beforeEach(() => {
    withScope.mockImplementation((cb: (scope: any) => void) =>
      cb({
        setExtra: vi.fn(),
        setUser: vi.fn(),
        setTag: vi.fn(),
        setFingerprint: vi.fn(),
      })
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('dispatches the terminal account error for a 403 whose body carries a terminal type, without reporting to Sentry', async () => {
    await runWithNetworkError(
      serverError(403, { error: { type: 'no_hmis_access' } })
    );

    expect(dispatchAccountErrorEvent).toHaveBeenCalledWith('no_hmis_access');
    expect(dispatchSessionTrackingEvent).not.toHaveBeenCalled();
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it('reports a 403 with an unrelated body to Sentry and dispatches nothing', async () => {
    const err = serverError(403, { error: { type: 'forbidden' } });
    await runWithNetworkError(err);

    expect(dispatchAccountErrorEvent).not.toHaveBeenCalled();
    expect(dispatchSessionTrackingEvent).not.toHaveBeenCalled();
    expect(Sentry.captureException).toHaveBeenCalledWith(err);
  });

  it('reports a 403 with a non-JSON body to Sentry and dispatches nothing', async () => {
    const err = serverError(403, '<html>Forbidden</html>');
    await runWithNetworkError(err);

    expect(dispatchAccountErrorEvent).not.toHaveBeenCalled();
    expect(Sentry.captureException).toHaveBeenCalledWith(err);
  });

  it('sends a 401 down the session-ended path, not the terminal one', async () => {
    await runWithNetworkError(
      serverError(401, { error: { type: 'unauthenticated' } })
    );

    expect(dispatchSessionTrackingEvent).toHaveBeenCalledWith(undefined);
    expect(dispatchAccountErrorEvent).not.toHaveBeenCalled();
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });
});
