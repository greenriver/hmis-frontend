import {
  HMIS_REMOTE_SESSION_UID_EVENT,
  HMIS_SESSION_UID_HEADER,
} from '@/modules/auth/api/constants';
import * as storage from '@/modules/auth/api/storage';

import apolloClient from '@/providers/apolloClient';
import { getCsrfToken } from '@/utils/csrf';

export interface HmisUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  sessionDuration: number;
  impersonating: boolean;
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

export async function fetchCurrentUser(): Promise<HmisUser | undefined> {
  const response = await fetch('/hmis/user.json', {
    credentials: 'include',
  });
  trackSessionFromResponse(response);

  if (response.ok) {
    const user: HmisUser | undefined = await response.json();
    if (user?.id) {
      storage.setUser(user);
      return user;
    }
    storage.clearUser();
    return undefined;
  } else {
    return Promise.reject(response.status);
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
  const response = await fetchWithCsrf('/hmis/session_keepalive', {
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

export function resetLocalSession() {
  storage.clearUser();
  storage.clearAppSettings();
  storage.clearSessionTacking();
  // Clear cache without re-fetching any queries
  apolloClient.clearStore();
}

export async function logout() {
  const response = await fetchWithCsrf('/hmis/logout', {
    method: 'DELETE',
  });
  trackSessionFromResponse(response);
  resetLocalSession();
  return response;
}

export const sentryUser = (user?: HmisUser) => {
  if (user && user.email) {
    return {
      email: user.email,
      username: user.name,
    };
  }
  const storedHmisUser = storage.getUser();
  if (storedHmisUser) {
    return {
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
