import { User } from '@sentry/react';
import {
  HMIS_REMOTE_SESSION_UID_EVENT,
  HMIS_SESSION_UID_HEADER,
} from '@/modules/auth/api/constants';
import * as storage from '@/modules/auth/api/storage';
import {
  isTerminalAccountErrorType,
  TerminalAccountErrorType,
} from '@/modules/auth/events';

import {
  AuthMethod,
  resolveAuthMethod,
} from '@/modules/hmisAppSettings/authMethod';
import apolloClient from '@/providers/apolloClient';
import { getCsrfToken } from '@/utils/csrf';
import { HttpError } from '@/utils/HttpError';

// Non-hook counterpart of useAuthMethod, for callers outside React.
const getAuthMethod = (): AuthMethod =>
  resolveAuthMethod(storage.getAppSettings()?.authMethod);

export interface HmisUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  sessionDuration: number;
  impersonating: boolean;
  primaryIdp?: string;
}
interface HmisError {
  type: string;
  message?: string;
}
interface HmisErrorResponse {
  error: HmisError;
}

export class HmisResponseError extends Error {
  hmis_error: HmisError;

  type: string;

  constructor(error: HmisError) {
    super(error.message || error.type);
    this.name = 'HmisResponseError';
    this.hmis_error = error;
    this.type = error.type;
    Object.setPrototypeOf(this, HmisResponseError.prototype);
  }
}

export const isHmisResponseError = (
  err: HmisResponseError | any
): err is HmisResponseError => {
  return !!(err instanceof Error && err.name === 'HmisResponseError');
};

// private - see if json response is the format we expect
const isHmisErrorResponse = (
  err: HmisErrorResponse | any
): err is HmisErrorResponse => {
  return !!(
    typeof err === 'object' &&
    typeof (err as HmisErrorResponse).error === 'object' &&
    typeof (err as HmisErrorResponse).error?.type === 'string'
  );
};

const throwMaybeHmisError = (json: any) => {
  if (isHmisErrorResponse(json)) {
    throw new HmisResponseError(json.error);
  } else {
    throw new Error('Unknown error');
  }
};

// check header and fire events for session tracking
const trackSessionFromResponse = (response: Response) => {
  const { headers } = response;
  if (headers) {
    const userId = headers.get(HMIS_SESSION_UID_HEADER) as string | undefined;
    document.dispatchEvent(
      new CustomEvent(HMIS_REMOTE_SESSION_UID_EVENT, { detail: userId })
    );
  }
};

// /hmis/user.json answers 200 even with no token, so a result with neither field
// set means signed out.
export interface CurrentUserResult {
  user?: HmisUser;
  // Set only under 'jwt', and on a 200 rather than an error status
  // (Hmis::UsersController#show).
  accountError?: TerminalAccountErrorType;
}

export async function fetchCurrentUser(): Promise<CurrentUserResult> {
  const response = await fetch('/hmis/user.json', {
    credentials: 'include',
  });
  trackSessionFromResponse(response);

  if (response.ok) {
    const payload: (HmisUser & { accountError?: unknown }) | undefined =
      await response.json();
    if (payload?.id) {
      storage.setUser(payload);
      if (payload.primaryIdp) {
        storage.setLastConnectorId(payload.primaryIdp);
      }
      return { user: payload };
    }
    storage.clearUser();
    // An unrecognized value reads as signed out: TERMINAL_ACCOUNT_ERROR_COPY has no
    // entry for it, so the terminal dialog would render with no title or message.
    const accountError = payload?.accountError;
    return isTerminalAccountErrorType(accountError) ? { accountError } : {};
  } else {
    return Promise.reject(
      new HttpError('Failed to fetch currentUser', response.status)
    );
  }
}

const fetchWithCsrf = (url: string, { headers, ...opts }: RequestInit) => {
  return fetch(url, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCsrfToken(),
      ...headers,
    },
    ...opts,
  });
};

export type LoginParams = {
  email?: string;
  password?: string;
  otpAttempt?: string;
};

export async function sendSessionKeepalive() {
  // Under 'jwt' the request passes through oauth2-proxy, which rejects the Devise
  // CSRF POST; a plain credentialed GET keeps the id_token cookie alive.
  const response =
    getAuthMethod() === 'jwt'
      ? await fetch('/hmis/session_keepalive', {
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        })
      : await fetchWithCsrf('/hmis/session_keepalive', {
          method: 'POST',
        });
  trackSessionFromResponse(response);
  return response;
}

export async function login({
  email,
  password,
  otpAttempt,
}: LoginParams): Promise<HmisUser> {
  const response = await fetchWithCsrf('/hmis/login', {
    method: 'POST',
    body: JSON.stringify({
      hmis_user: {
        email,
        password,
        otp_attempt: otpAttempt,
      },
    }),
  });
  trackSessionFromResponse(response);

  if (!response.ok) {
    return response.json().then(throwMaybeHmisError);
  } else {
    // Store the user info (non-sensitive) in the browser
    const user = (await response.json()) as HmisUser;
    storage.setUser(user);
    return user;
  }
}

// The Apollo cache and stored user hold client PII/PHI and should not survive a
// sign-out attempt on a shared device, even when the server-side session does.
// `keepSessionTracking` spares the tracking record on a failed sign-out:
// useSessionStatus reads it to decide whether the session is still alive, so
// clearing it while the session survives makes the app report "Your session has
// ended". That record holds no PII.
export function resetLocalSession({ keepSessionTracking = false } = {}) {
  storage.clearUser();
  storage.clearAppSettings();
  if (!keepSessionTracking) storage.clearSessionTacking();
  // Clear cache without re-fetching any queries
  apolloClient.clearStore();
}

export async function logout() {
  const response = await fetchWithCsrf('/hmis/logout', {
    method: 'DELETE',
  });
  if (!response.ok) {
    // Don't add trackSessionFromResponse here: it would read the failed sign-out as
    // a session change and clear the tracking record resetLocalSession just kept.
    // The Devise logout controller descends from Devise::SessionsController, not
    // Hmis::BaseController, so it never sets the user header that call reads.
    resetLocalSession({ keepSessionTracking: true });
    return response.json().then(throwMaybeHmisError);
  }

  trackSessionFromResponse(response);
  resetLocalSession();
  return response;
}

export const sentryUser = (user?: HmisUser): User | undefined => {
  if (user && user.email) {
    return {
      id: user.id,
      email: user.email,
      username: user.name,
    };
  }
  const storedHmisUser = storage.getUser();
  if (storedHmisUser) {
    return {
      id: storedHmisUser.id,
      email: storedHmisUser.email,
      username: storedHmisUser.name,
    };
  }
  return undefined;
};

export async function startImpersonating(userId: string) {
  const response = await fetchWithCsrf('/hmis/impersonations', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
  trackSessionFromResponse(response);

  if (!response.ok) {
    return response.json().then(throwMaybeHmisError);
  } else {
    apolloClient.clearStore();
    // Store the user info (non-sensitive) in the browser
    const user = (await response.json()) as HmisUser;
    storage.setUser(user);
    return user;
  }
}

export async function stopImpersonating() {
  const response = await fetchWithCsrf('/hmis/impersonations', {
    method: 'DELETE',
  });
  trackSessionFromResponse(response);

  if (!response.ok) {
    return response.json().then(throwMaybeHmisError);
  } else {
    apolloClient.clearStore();
    // Store the user info (non-sensitive) in the browser
    const user = (await response.json()) as HmisUser;
    storage.setUser(user);
    return user;
  }
}

// if we auto-reload due to an error, only do it once
export const RELOAD_ONCE_SESSION_KEY = 'reload-once';
