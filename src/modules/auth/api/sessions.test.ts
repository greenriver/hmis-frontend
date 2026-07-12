import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Keep the module graph light and side-effect free: the real apolloClient builds
// the whole Apollo link chain at import, and csrf reads a DOM meta tag.
vi.mock('@/providers/apolloClient', () => ({
  default: { clearStore: vi.fn(), resetStore: vi.fn() },
}));
vi.mock('@/utils/csrf', () => ({ getCsrfToken: () => 'test-csrf-token' }));
vi.mock('@/modules/auth/api/storage', () => ({
  getAppSettings: vi.fn(),
  setUser: vi.fn(),
  clearUser: vi.fn(),
  clearAppSettings: vi.fn(),
  clearSessionTacking: vi.fn(),
}));

import { logout, sendSessionKeepalive } from './sessions';
import * as storage from '@/modules/auth/api/storage';
import apolloClient from '@/providers/apolloClient';

const getAppSettings = storage.getAppSettings as ReturnType<typeof vi.fn>;

const okResponse = () =>
  ({ ok: true, headers: new Map() }) as unknown as Response;

describe('session transport by auth method', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue(okResponse());
    vi.stubGlobal('fetch', fetchMock);
    // trackSessionFromResponse dispatches a DOM event; stub it out for node.
    vi.stubGlobal('document', { dispatchEvent: vi.fn() });
    vi.stubGlobal(
      'CustomEvent',
      class {
        constructor(
          public type: string,
          public init?: unknown
        ) {}
      }
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe('sendSessionKeepalive', () => {
    it('Devise/Okta: POSTs with the CSRF token (unchanged behavior)', async () => {
      getAppSettings.mockReturnValue({ authMethod: 'devise' });
      await sendSessionKeepalive();

      const [url, opts] = fetchMock.mock.calls[0];
      expect(url).toBe('/hmis/session_keepalive');
      expect(opts.method).toBe('POST');
      expect(opts.headers['X-CSRF-Token']).toBe('test-csrf-token');
    });

    it('JWT/SSO: GETs without a CSRF token so oauth2-proxy accepts it', async () => {
      getAppSettings.mockReturnValue({ authMethod: 'jwt' });
      await sendSessionKeepalive();

      const [url, opts] = fetchMock.mock.calls[0];
      expect(url).toBe('/hmis/session_keepalive');
      expect(opts.method).toBe('GET');
      expect(opts.credentials).toBe('include');
      expect(opts.headers['X-CSRF-Token']).toBeUndefined();
    });
  });

  describe('logout', () => {
    it('Devise/Okta: DELETEs with the CSRF token (unchanged behavior)', async () => {
      getAppSettings.mockReturnValue({ authMethod: 'devise' });
      await logout();

      const [url, opts] = fetchMock.mock.calls[0];
      expect(url).toBe('/hmis/logout');
      expect(opts.method).toBe('DELETE');
      expect(opts.headers['X-CSRF-Token']).toBe('test-csrf-token');
    });

    it('JWT/SSO: DELETEs without a CSRF token so oauth2-proxy accepts it', async () => {
      getAppSettings.mockReturnValue({ authMethod: 'jwt' });
      await logout();

      const [url, opts] = fetchMock.mock.calls[0];
      expect(url).toBe('/hmis/logout');
      expect(opts.method).toBe('DELETE');
      expect(opts.credentials).toBe('include');
      expect(opts.headers['X-CSRF-Token']).toBeUndefined();
    });

    it('clears local session state regardless of auth method', async () => {
      getAppSettings.mockReturnValue({ authMethod: 'jwt' });
      await logout();
      // Full resetLocalSession teardown: dropping any of these would leak the
      // prior user's data to the next login on a shared device. The Apollo cache
      // clear is the highest-risk one - it holds fetched client PII/PHI.
      expect(apolloClient.clearStore).toHaveBeenCalled();
      expect(storage.clearUser).toHaveBeenCalled();
      expect(storage.clearAppSettings).toHaveBeenCalled();
      expect(storage.clearSessionTacking).toHaveBeenCalled();
    });
  });
});
