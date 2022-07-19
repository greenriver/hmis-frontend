import * as storage from './storage';

import { getCsrfToken } from '@/utils/csrf';

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
    return response.json().then((e: HmisErrorResponse) => {
      throw new Error(e.error.type);
    });
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
    return response.json().then((e: HmisErrorResponse) => {
      // FIXME standardize error responses in HMIS. Failed login has a different shape.
      const message = typeof e.error === 'string' ? e.error : e.error.type;
      throw new Error(message);
    });
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
