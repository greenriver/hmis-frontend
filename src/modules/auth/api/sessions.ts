import * as storage from './storage';

import { getCsrfToken } from '@/utils/csrf';

export interface HmisUser {
  email: string;
  name: string;
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

export async function getCurrentUser(): Promise<HmisUser> {
  const storedUser = storage.getUser();
  if (storedUser) {
    return Promise.resolve(JSON.parse(storedUser) as HmisUser);
  }
  const response = await fetch('/hmis/user.json', {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCsrfToken(),
    },
  });
  if (!response.ok) {
    return response.json().then(throwMaybeHmisError);
  } else {
    return response.json() as Promise<HmisUser>;
  }
}

export type LoginParams = {
  email?: string;
  password?: string;
  otpAttempt?: string;
};

export async function login({
  email,
  password,
  otpAttempt,
}: LoginParams): Promise<HmisUser> {
  const response = await fetch('/hmis/login', {
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
  const response = await fetch('/hmis/logout', {
    method: 'DELETE',
    headers: { 'X-CSRF-Token': getCsrfToken() },
  });
  storage.removeUser();
  return response;
}
