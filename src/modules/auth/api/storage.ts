import { HmisUser } from './sessions';

export const USER_STORAGE_KEY = '_hmis_user_info';
export const SESSION_STORAGE_KEY = '_hmis_session_ts';

const parseJson = <T>(value: string | undefined) => {
  try {
    return value ? (JSON.parse(value) as T) : undefined;
  } catch {
    return undefined;
  }
};

// Stores user name and email. No sensitive information stored!
export const setUser = (user: HmisUser) =>
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ user, ...setUser }));

export const getUser = () => {
  const value = localStorage.getItem(USER_STORAGE_KEY);
  return value ? parseJson<HmisUser>(value) : undefined;
};

export const removeUser = () => localStorage.removeItem(USER_STORAGE_KEY);

export interface SessionExpiry {
  userId: string;
  timestamp: number;
}
export const setSessionExpiry = (session: SessionExpiry) => {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
};

export const clearSessionExpiry = () => {
  localStorage.removeItem(SESSION_STORAGE_KEY);
};

export const getSessionExpiry = () => {
  const value = localStorage.getItem(SESSION_STORAGE_KEY);
  return value ? (parseJson(value) as SessionExpiry) : undefined;
};
