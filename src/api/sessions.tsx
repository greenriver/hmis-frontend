function getCsrfToken() {
  const name = 'CSRF-Token=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return decodeURIComponent(c.substring(name.length, c.length));
    }
  }
  return '';
}

export async function getCurrentUser(): Promise<HmisUser> {
  const response = await fetch('/hmis-api/user', {
    credentials: 'include',
    headers: { 'X-CSRF-Token': getCsrfToken() },
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

// FIXME remove
export async function getProjects(project_types: string[]) {
  const response = await fetch('/hmis-api/projects', {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCsrfToken(),
    },
    body: JSON.stringify({ project_types }),
  });
  if (!response.ok) {
    return response.json().then((e: HmisErrorResponse) => {
      throw new Error(e.error.type);
    });
  } else {
    return response.json();
  }
}
