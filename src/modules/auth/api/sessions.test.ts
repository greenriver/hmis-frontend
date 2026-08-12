import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
  setLastConnectorId: vi.fn(),
}));

import {
  fetchCurrentUser,
  HmisResponseError,
  logout,
  sendSessionKeepalive,
} from './sessions';
import * as storage from '@/modules/auth/api/storage';
import apolloClient from '@/providers/apolloClient';

const getAppSettings = storage.getAppSettings as ReturnType<typeof vi.fn>;

const okResponse = () =>
  ({ ok: true, headers: new Map() }) as unknown as Response;

const errorResponse = (json: () => Promise<any>) =>
  ({ ok: false, headers: new Map(), json }) as unknown as Response;

const jsonResponse = (body: any) =>
  ({
    ok: true,
    headers: new Map(),
    json: () => Promise.resolve(body),
  }) as unknown as Response;

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
    it('Devise/Okta: POSTs with the CSRF token', async () => {
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

  describe('fetchCurrentUser: the 200 payload separates signed out from terminal states', () => {
    it('returns the user for a signed-in payload', async () => {
      fetchMock.mockResolvedValue(
        jsonResponse({ id: '1', name: 'Test User', primaryIdp: 'keycloak' })
      );

      const result = await fetchCurrentUser();
      expect(result.user?.id).toBe('1');
      expect(result.accountError).toBeUndefined();
      expect(storage.setUser).toHaveBeenCalled();
      expect(storage.setLastConnectorId).toHaveBeenCalledWith('keycloak');
    });

    it.each(['account_deactivated', 'no_warehouse_account'])(
      'reports %s from the 200 payload, with no user',
      async (accountError) => {
        fetchMock.mockResolvedValue(
          jsonResponse({ impersonating: false, accountError })
        );

        const result = await fetchCurrentUser();
        expect(result.accountError).toBe(accountError);
        expect(result.user).toBeUndefined();
        expect(storage.clearUser).toHaveBeenCalled();
      }
    );

    it('reads a tokenless payload as signed out, not as a terminal state', async () => {
      // Reading this as terminal would show the sign-out page to every visitor who
      // is not signed in yet.
      fetchMock.mockResolvedValue(jsonResponse({ impersonating: false }));

      const result = await fetchCurrentUser();
      expect(result.user).toBeUndefined();
      expect(result.accountError).toBeUndefined();
    });

    it('ignores an unrecognized accountError rather than showing a page with no copy', async () => {
      fetchMock.mockResolvedValue(
        jsonResponse({ impersonating: false, accountError: 'something_new' })
      );

      const result = await fetchCurrentUser();
      expect(result.accountError).toBeUndefined();
    });

    it('rejects with an HttpError on a non-ok response', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        headers: new Map(),
      } as unknown as Response);

      const err = await fetchCurrentUser().catch((e) => e);
      expect(err.status).toBe(500);
    });
  });

  describe('logout', () => {
    it('DELETEs with the CSRF token regardless of auth method (JWT logout enforces CSRF too)', async () => {
      getAppSettings.mockReturnValue({ authMethod: 'jwt' });
      await logout();

      const [url, opts] = fetchMock.mock.calls[0];
      expect(url).toBe('/hmis/logout');
      expect(opts.method).toBe('DELETE');
      expect(opts.headers['X-CSRF-Token']).toBe('test-csrf-token');
    });

    it('clears local session state regardless of auth method', async () => {
      getAppSettings.mockReturnValue({ authMethod: 'jwt' });
      await logout();
      // Dropping any of these leaks the prior user's data, including the client
      // PII/PHI in the Apollo cache, to the next login on a shared device.
      expect(apolloClient.clearStore).toHaveBeenCalled();
      expect(storage.clearUser).toHaveBeenCalled();
      expect(storage.clearAppSettings).toHaveBeenCalled();
      expect(storage.clearSessionTacking).toHaveBeenCalled();
    });

    it('throws HmisResponseError when the server refuses the sign-out', async () => {
      getAppSettings.mockReturnValue({ authMethod: 'jwt' });
      fetchMock.mockResolvedValue(
        errorResponse(() =>
          Promise.resolve({
            error: { type: 'server_error', message: 'Could not end session' },
          })
        )
      );

      const err = await logout().catch((e) => e);
      expect(err).toBeInstanceOf(HmisResponseError);
      expect(err.type).toBe('server_error');
      expect(err.message).toBe('Could not end session');
      // The PII teardown still has to happen on the failure path.
      expect(apolloClient.clearStore).toHaveBeenCalled();
      expect(storage.clearUser).toHaveBeenCalled();
      expect(storage.clearAppSettings).toHaveBeenCalled();
      // But not the tracking record: the session is still live, and clearing it
      // makes useSessionStatus report "Your session has ended" over the dialog.
      expect(storage.clearSessionTacking).not.toHaveBeenCalled();
    });

    it('throws when a failed sign-out has an unparseable body', async () => {
      getAppSettings.mockReturnValue({ authMethod: 'jwt' });
      fetchMock.mockResolvedValue(
        errorResponse(() => Promise.reject(new SyntaxError('Unexpected token')))
      );

      await expect(logout()).rejects.toThrow();
      expect(apolloClient.clearStore).toHaveBeenCalled();
      expect(storage.clearUser).toHaveBeenCalled();
      expect(storage.clearAppSettings).toHaveBeenCalled();
      expect(storage.clearSessionTacking).not.toHaveBeenCalled();
    });

    it('does not dispatch a session-tracking event when the sign-out fails', async () => {
      getAppSettings.mockReturnValue({ authMethod: 'jwt' });
      fetchMock.mockResolvedValue(
        errorResponse(() => Promise.resolve({ error: { type: 'server' } }))
      );

      await logout().catch(() => undefined);
      // trackSessionFromResponse would read the failed response as a session
      // change and clear the tracking record kept above; see logout().
      expect(document.dispatchEvent).not.toHaveBeenCalled();
    });
  });
});
