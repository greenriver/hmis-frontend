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

  const json = await response.json();

  if (response.ok) {
    return json;
  } else {
    const error = new HttpError(
      `Failed to fetch app settings`,
      response.status
    );
    error.cause = json;
    throw error;
  }
};
