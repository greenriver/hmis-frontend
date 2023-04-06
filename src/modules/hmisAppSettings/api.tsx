import { HmisAppSettings } from './types';

import { getCsrfToken } from '@/utils/csrf';

export const fetchHmisAppSettings = async (): Promise<HmisAppSettings> => {
  const response = await fetch(`/hmis/app_settings`, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCsrfToken(),
    },
  });
  return response.json();
};
