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
    // An error body is not always JSON: oauth2-proxy answers a 401 with HTML.
    // Parsing it unguarded throws a SyntaxError in place of this HttpError, and
    // the reload-once-on-401 recovery reads the HttpError to decide to reload.
    error.cause = await response.json().catch(() => undefined);
    throw error;
  }

  return response.json();
};
