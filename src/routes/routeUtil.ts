import { Location, To } from 'react-router-dom';

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

export const injectSearchParams = (
  route: string, // route with params, e.g.  '/projects/218/bed-nights?coc=MA-509'
  inject: Record<string, any> // search params to inject
): To | undefined => {
  let url: URL | undefined;
  try {
    url = new URL(route, window.location.href);
  } catch (e) {
    console.error(e);
  }

  if (!url) return route;

  Object.keys(inject).forEach((key) => {
    (url as URL).searchParams.set(key, inject[key] || '');
  });

  return `${url.pathname}?${url.searchParams.toString()}`;
};
