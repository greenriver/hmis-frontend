import { HmisAppSettings } from './types';

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
    throw new Error(`Failed to fetch app settings: ${JSON.stringify(json)}`, {
      cause: json,
    });
  }
};
