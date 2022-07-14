const USER_STORAGE_KEY = '_hmis_user_info';

// Stores user name and email. No sensitive information stored!
export const setUser = (user: HmisUser) =>
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

export const getUser = () => localStorage.getItem(USER_STORAGE_KEY);

export const removeUser = () => localStorage.removeItem(USER_STORAGE_KEY);
