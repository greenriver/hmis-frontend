export const USER_STORAGE_KEY = '_hmis_user_info';
const PREVIOUS_ROUTE = '_hmis_previous_route';

// Stores user name and email. No sensitive information stored!
export const setUser = (user: object) =>
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

export const getUser = () => localStorage.getItem(USER_STORAGE_KEY);

export const removeUser = () => localStorage.removeItem(USER_STORAGE_KEY);

// Store URL before logging out
export const setPreviousRoute = (route: string) =>
  localStorage.setItem(PREVIOUS_ROUTE, JSON.stringify(route));

export const getPreviousRoute = () => localStorage.getItem(PREVIOUS_ROUTE);

export const removePreviousRoute = () =>
  localStorage.removeItem(PREVIOUS_ROUTE);
