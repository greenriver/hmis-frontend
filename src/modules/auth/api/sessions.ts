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
    console.error(json);
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
    const user = await response.json();
    return user.id ? user : undefined;
  } else {
    return Promise.reject(response.status);
  }
}

const fetchWithCsrfRetry = async (url: string, opts: RequestInit) => {
  const headers = () => ({
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-CSRF-Token': getCsrfToken(),
  });

  try {
    return await fetch(url, {
      headers: headers(),
      ...opts,
    });
  } catch (error) {
    // check for csrf failures and crudely send
    const csrfFailure =
      isHmisResponseError(error) && error.type === 'unverified_request';
    if (!csrfFailure) throw error;

    // curde retry on CSRF failure
    return await fetch(url, {
      headers: headers(),
      ...opts,
    });
  }
};

export type LoginParams = {
  email?: string;
  password?: string;
  otpAttempt?: string;
};

export async function sendSessionKeepalive() {
  const response = await fetchWithCsrfRetry('/hmis/session_keepalive', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCsrfToken(),
    },
  });
  trackSessionFromResponse(response);
  return response;
}

export async function login({
  email,
  password,
  otpAttempt,
}: LoginParams): Promise<HmisUser> {
  const response = await fetchWithCsrfRetry('/hmis/login', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCsrfToken(),
    },
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
    return response.json().then((user: HmisUser) => {
      storage.setUser(user);
      return user;
    });
  }
}

export async function logout() {
  const response = await fetchWithCsrfRetry('/hmis/logout', {
    method: 'DELETE',
    headers: { 'X-CSRF-Token': getCsrfToken() },
  });
  trackSessionFromResponse(response);
  storage.clearUser();
  storage.clearAppSettings();
  storage.clearSessionTacking();
  // Clear cache without re-fetching any queries
  apolloClient.clearStore();
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
