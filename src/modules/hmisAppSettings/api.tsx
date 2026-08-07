import { HmisAppSettings } from './types';
import { HttpError } from '@/utils/HttpError';

export const fetchHmisAppSettings = async (): Promise<HmisAppSettings> => {
  const response = await fetch(`/hmis/app_settings`, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = new HttpError(
      `Failed to fetch app settings`,
      response.status
    );
    // Best-effort: attach a parsed body if there is one, but never let a
    // non-JSON error body (e.g. an oauth2-proxy HTML redirect on 401) throw a
    // SyntaxError that masks the HttpError the reload-once-on-401 recovery needs.
    error.cause = await response.json().catch(() => undefined);
    throw error;
  }

  return response.json();
};
