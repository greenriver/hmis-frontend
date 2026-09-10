import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HMIS_ACCOUNT_ERROR_EVENT } from '@/modules/auth/api/constants';
import {
  dispatchAccountErrorEvent,
  isTerminalAccountErrorType,
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
