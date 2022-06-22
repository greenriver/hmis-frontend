import { getCsrfToken } from '@/utils/csrf';

export async function getCurrentUser(): Promise<HmisUser> {
  const response = await fetch('/hmis-api/user.json', {
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
  const response = await fetch('/hmis-api/login', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCsrfToken(),
    },
    body: JSON.stringify({
      hmis_api_user: {
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
    return response.json() as Promise<HmisUser>;
  }
}

export async function logout() {
  const response = await fetch('/hmis-api/logout', {
    method: 'DELETE',
    headers: { 'X-CSRF-Token': getCsrfToken() },
  });

  return response;
}
