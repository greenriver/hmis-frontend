import { Location } from 'react-router-dom';

export type LocationState = {
  fromLoginRedirect?: boolean;
};

export const STATE_FROM_LOGIN_REDIRECT: LocationState = {
  fromLoginRedirect: true,
};

export const locationFromDefaultOrLogin = (location: Location): boolean => {
  // Page was loaded directly from the URL
  if (location.key === 'default') return true;

  // Page was loaded from a login redirect
  return !!location.state?.fromLoginRedirect;
};
