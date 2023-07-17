import fetchRetryCb, { RequestInitRetryParams } from 'fetch-retry';

import { HmisAppSettings } from './types';

import { isHmisResponseError } from '@/modules/auth/api/sessions';
import { getCsrfToken } from '@/utils/csrf';

const fetchWithRetry = fetchRetryCb(window.fetch);
const csrfFailure: RequestInitRetryParams['retryOn'] = (_attempt, error) => {
  return isHmisResponseError(error) && error.type === 'unverified_request';
};

export const fetchHmisAppSettings = async (): Promise<HmisAppSettings> => {
  const response = await fetchWithRetry(`/hmis/app_settings`, {
    credentials: 'include',
    retries: 1,
    retryOn: csrfFailure,

    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCsrfToken(),
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
