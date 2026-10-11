import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HMIS_ACCOUNT_ERROR_EVENT } from '@/modules/auth/api/constants';
import {
  dispatchAccountErrorEvent,
  dispatchSessionTrackingFromHeaders,
  isTerminalAccountErrorType,
  keepaliveOutcome,
  sessionRemainingSecsFromHeaders,
  terminalAccountErrorFromResponseBody,
} from '@/modules/auth/events';

describe('isTerminalAccountErrorType', () => {
  it('accepts the states re-auth cannot clear', () => {
    expect(isTerminalAccountErrorType('account_deactivated')).toBe(true);
    expect(isTerminalAccountErrorType('no_warehouse_account')).toBe(true);
    expect(isTerminalAccountErrorType('no_hmis_access')).toBe(true);
  });

  it('rejects anything else, including 401-style types the re-auth path owns', () => {
    expect(isTerminalAccountErrorType('unauthenticated')).toBe(false);
    expect(isTerminalAccountErrorType('inactive')).toBe(false);
    expect(isTerminalAccountErrorType(undefined)).toBe(false);
    expect(isTerminalAccountErrorType(null)).toBe(false);
    expect(isTerminalAccountErrorType(403)).toBe(false);
  });
});

describe('terminalAccountErrorFromResponseBody', () => {
  it('returns the type for a terminal error body', () => {
    expect(
      terminalAccountErrorFromResponseBody({
        error: { type: 'no_hmis_access' },
      })
    ).toBe('no_hmis_access');
  });

  it('returns undefined for a non-terminal type', () => {
    expect(
      terminalAccountErrorFromResponseBody({
        error: { type: 'unauthenticated' },
      })
    ).toBeUndefined();
  });

  it('returns undefined for empty or malformed bodies', () => {
    expect(terminalAccountErrorFromResponseBody({})).toBeUndefined();
    expect(terminalAccountErrorFromResponseBody(null)).toBeUndefined();
    expect(terminalAccountErrorFromResponseBody(undefined)).toBeUndefined();
    expect(
      terminalAccountErrorFromResponseBody('no_hmis_access')
    ).toBeUndefined();
  });
});

describe('dispatchAccountErrorEvent', () => {
  let dispatched: Array<{ type: string; init?: { detail?: unknown } }>;

  beforeEach(() => {
    dispatched = [];
    vi.stubGlobal('document', {
      dispatchEvent: (event: any) => {
        dispatched.push(event);
        return true;
      },
    });
    vi.stubGlobal(
      'CustomEvent',
      class {
        constructor(
          public type: string,
          public init?: { detail?: unknown }
        ) {}
      }
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('dispatches HMIS_ACCOUNT_ERROR_EVENT with the type as detail', () => {
    dispatchAccountErrorEvent('no_hmis_access');

    expect(dispatched).toHaveLength(1);
    expect(dispatched[0].type).toBe(HMIS_ACCOUNT_ERROR_EVENT);
    expect(dispatched[0].init?.detail).toBe('no_hmis_access');
  });
});

describe('dispatchSessionTrackingFromHeaders', () => {
  let dispatched: Array<{ type: string; init?: { detail?: unknown } }>;

  beforeEach(() => {
    dispatched = [];
    vi.stubGlobal('document', {
      dispatchEvent: (event: any) => {
        dispatched.push(event);
        return true;
      },
    });
    vi.stubGlobal(
      'CustomEvent',
      class {
        constructor(
          public type: string,
          public init?: { detail?: unknown }
        ) {}
      }
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reports the remaining seconds with the request start time', () => {
    dispatchSessionTrackingFromHeaders(
      new Headers({
        'X-app-user-id': '7',
        'X-app-session-remaining-secs': '1500',
      }),
      123.5
    );

    expect(dispatched[0].init?.detail).toEqual({
      userId: '7',
      remainingSecs: 1500,
      requestedAt: 123.5,
    });
  });

  it('reports only the user without the remaining-seconds header', () => {
    dispatchSessionTrackingFromHeaders(
      new Headers({ 'X-app-user-id': '7' }),
      123.5
    );

    expect(dispatched[0].init?.detail).toEqual({ userId: '7' });
  });

  it('reports no user for an empty user header', () => {
    dispatchSessionTrackingFromHeaders(
      new Headers({ 'X-app-user-id': '' }),
      123.5
    );

    expect(dispatched[0].init?.detail).toEqual({ userId: undefined });
  });
});

describe('sessionRemainingSecsFromHeaders', () => {
  it('parses the remaining seconds', () => {
    expect(
      sessionRemainingSecsFromHeaders(
        new Headers({ 'X-app-session-remaining-secs': '120' })
      )
    ).toBe(120);
  });

  it('returns undefined for a missing or non-numeric header', () => {
    expect(sessionRemainingSecsFromHeaders(new Headers())).toBeUndefined();
    expect(
      sessionRemainingSecsFromHeaders(
        new Headers({ 'X-app-session-remaining-secs': 'abc' })
      )
    ).toBeUndefined();
  });
});

describe('keepaliveOutcome', () => {
  const keepalive = (status: number, remainingSecs?: string) =>
    new Response('{}', {
      status,
      headers: remainingSecs
        ? { 'X-app-session-remaining-secs': remainingSecs }
        : {},
    });

  it('reports a signed-out session on a 401, even with the remaining-seconds header', () => {
    expect(keepaliveOutcome(keepalive(401, '1500'), 300)).toBe('signedOut');
  });

  it('reloads when refused', () => {
    expect(keepaliveOutcome(keepalive(403), 300)).toBe('reload');
  });

  it('reports an error without reloading on a server error', () => {
    expect(keepaliveOutcome(keepalive(500, '120'), 300)).toBe('error');
    expect(keepaliveOutcome(keepalive(502), 300)).toBe('error');
  });

  it('reports a failed refresh when the token is still inside the warning window', () => {
    expect(keepaliveOutcome(keepalive(200, '120'), 300)).toBe('renewFailed');
  });

  it('reports a renewal when the token is outside the warning window', () => {
    expect(keepaliveOutcome(keepalive(200, '1500'), 300)).toBe('renewed');
  });

  it('reports a renewal without the remaining-seconds header (Devise)', () => {
    expect(keepaliveOutcome(keepalive(200), 300)).toBe('renewed');
  });
});
