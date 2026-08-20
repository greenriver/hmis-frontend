import { describe, expect, it } from 'vitest';

import { isTerminalAccountErrorType } from '@/modules/auth/events';

describe('isTerminalAccountErrorType', () => {
  it('accepts the two states re-auth cannot clear', () => {
    expect(isTerminalAccountErrorType('account_deactivated')).toBe(true);
    expect(isTerminalAccountErrorType('no_warehouse_account')).toBe(true);
  });

  it('rejects anything else, including 401-style types the re-auth path owns', () => {
    expect(isTerminalAccountErrorType('unauthenticated')).toBe(false);
    expect(isTerminalAccountErrorType('inactive')).toBe(false);
    expect(isTerminalAccountErrorType(undefined)).toBe(false);
    expect(isTerminalAccountErrorType(null)).toBe(false);
    expect(isTerminalAccountErrorType(403)).toBe(false);
  });
});
