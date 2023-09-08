import { HmisUser } from '@/modules/auth/api/sessions';
import { HmisAppSettings } from '@/modules/hmisAppSettings/types';

export const USER_STORAGE_KEY = '_hmis_user_info';
export const SETTINGS_STORAGE_KEY = '_hmis_app_settings';
export const SESSION_TRACKING_STORAGE_KEY = '_hmis_session_ts';

const parseJson = <T>(value: string | undefined) => {
  try {
    return value ? (JSON.parse(value) as T) : undefined;
  } catch {
    return undefined;
  }
};

// Stores user name and email. No sensitive information stored!
export const setUser = (value: HmisUser) =>
  sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(value));

export const getUser = () => {
  const value = sessionStorage.getItem(USER_STORAGE_KEY);
  return value ? parseJson<HmisUser>(value) : undefined;
};

export const clearUser = () => sessionStorage.removeItem(USER_STORAGE_KEY);

export const setAppSettings = (value: HmisAppSettings) =>
  sessionStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(value));

export const getAppSettings = () => {
  const value = sessionStorage.getItem(SETTINGS_STORAGE_KEY);
  return value ? parseJson<HmisAppSettings>(value) : undefined;
};

export const clearAppSettings = () =>
  sessionStorage.removeItem(SETTINGS_STORAGE_KEY);

export interface HmisSessionTracking {
  userId: string;
  timestamp: number;
}
export const setSessionTracking = (session: HmisSessionTracking) => {
  sessionStorage.setItem(SESSION_TRACKING_STORAGE_KEY, JSON.stringify(session));
};

export const clearSessionTacking = () => {
  sessionStorage.removeItem(SESSION_TRACKING_STORAGE_KEY);
};

export const getSessionTracking = () => {
  const value = sessionStorage.getItem(SESSION_TRACKING_STORAGE_KEY);
  return value ? (parseJson(value) as HmisSessionTracking) : undefined;
};
