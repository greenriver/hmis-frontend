import { describe, expect, it } from 'vitest';

import { resolveAuthMethod } from './authMethod';

describe('resolveAuthMethod', () => {
  it("opts into 'jwt' only for the exact backend value 'jwt'", () => {
    expect(resolveAuthMethod('jwt')).toBe('jwt');
    expect(resolveAuthMethod('devise')).toBe('devise');
  });

  it("defaults to 'devise' when the backend omits authMethod", () => {
    expect(resolveAuthMethod(undefined)).toBe('devise');
  });

  it("collapses any unrecognized value to 'devise' so every call site agrees", () => {
    expect(resolveAuthMethod('okta' as any)).toBe('devise');
    expect(resolveAuthMethod('JWT' as any)).toBe('devise');
  });
});
