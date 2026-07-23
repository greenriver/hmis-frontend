import { HmisUser } from '@/modules/auth/api/sessions';
import { HmisAppSettings } from '@/modules/hmisAppSettings/types';
import { parseJson } from '@/utils/jsonUtil';

export const SESSION_KEY = '_hmis_session_id';
export const USER_STORAGE_KEY = '_hmis_user_info';
export const SETTINGS_STORAGE_KEY = '_hmis_app_settings';
export const SESSION_TRACKING_STORAGE_KEY = '_hmis_session_ts';
export const LAST_CONNECTOR_ID_KEY = '_hmis_last_connector_id';
const PATH_PARAMS_KEY = '_hmis_path_params';

// Stores user name and email. No sensitive information stored!
export const setUser = (value: HmisUser) =>
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(value));

export const getUser = () => {
  const value = localStorage.getItem(USER_STORAGE_KEY);
  return value ? parseJson<HmisUser>(value) : undefined;
};

export const clearUser = () => localStorage.removeItem(USER_STORAGE_KEY);

// session id allows expiration of local store based on session
export const setLastSessionId = (value: string) =>
  localStorage.setItem(SESSION_KEY, value);

export const getLastSessionId = () => {
  return localStorage.getItem(SESSION_KEY);
};

export const setAppSettings = (value: HmisAppSettings) =>
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(value));

export const getAppSettings = () => {
  const value = localStorage.getItem(SETTINGS_STORAGE_KEY);
  return value ? parseJson<HmisAppSettings>(value) : undefined;
};

export const clearAppSettings = () =>
  localStorage.removeItem(SETTINGS_STORAGE_KEY);

// Store last used connector/IDP ID to bypass IDP picker on next sign-in
export const setLastConnectorId = (value: string) =>
  localStorage.setItem(LAST_CONNECTOR_ID_KEY, value);

export const getLastConnectorId = () => {
  return localStorage.getItem(LAST_CONNECTOR_ID_KEY);
};

export const clearLastConnectorId = () =>
  localStorage.removeItem(LAST_CONNECTOR_ID_KEY);

export interface HmisSessionTracking {
  userId: string;
  timestamp: number;
}
export const setSessionTracking = (session: HmisSessionTracking) => {
  localStorage.setItem(SESSION_TRACKING_STORAGE_KEY, JSON.stringify(session));
};

export const clearSessionTacking = () => {
  localStorage.removeItem(SESSION_TRACKING_STORAGE_KEY);
};

export const getSessionTracking = () => {
  const value = localStorage.getItem(SESSION_TRACKING_STORAGE_KEY);
  return value ? (parseJson(value) as HmisSessionTracking) : undefined;
};

/**
 * [get|set]StoredPathParams generically supports saving page attributes
 * in browser storage, on a per-page-path basis. For example, on the
 * `/projects/:projectId/enrollments` page, we could store key-value pairs like:
 * {
 *   optionalColumns: [...],
 *   sort: ...
 * }
 *
 * Then each time the user requests that path, we display the data to them with
 * the same optional columns and sort that they last loaded.
 */
export const getStoredPathParams = (path: string) => {
  const value = localStorage.getItem(PATH_PARAMS_KEY);
  if (!value) return undefined;

  const allPathParams = parseJson(value) as Record<string, any>;
  return allPathParams?.[path];
};

export const setStoredPathParams = (
  path: string,
  params: Record<string, any>
) => {
  const value = localStorage.getItem(PATH_PARAMS_KEY);
  const existingParams = value
    ? (parseJson(value) as Record<string, any>) || {}
    : {};
  const existingPathParams = existingParams[path];
  const newParams = {
    ...existingParams,
    [path]: {
      ...existingPathParams,
      ...params,
    },
  };
  localStorage.setItem(PATH_PARAMS_KEY, JSON.stringify(newParams));
};
