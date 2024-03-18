import { Location, To, matchRoutes } from 'react-router-dom';
import { allRoutes } from './routes';

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

export const PREV_SEARCH_KEY = 'prev';
export const prevSearchParam = () =>
  `${PREV_SEARCH_KEY}=${encodeURIComponent(
    window.location.pathname + window.location.search
  )}`;

export const toPreviousUrlFromSearchParam = (
  params: URLSearchParams,
  inject: Record<string, any>
): To | undefined => {
  const prevParam = params.get(PREV_SEARCH_KEY);
  if (!prevParam) return;

  let url: URL | undefined;
  try {
    url = new URL(prevParam, window.location.href);
  } catch (e) {
    console.error(e);
  }

  if (!url) return;

  Object.keys(inject).forEach((key) => {
    (url as URL).searchParams.set(key, inject[key] || '');
  });

  const matches = matchRoutes(allRoutes, url.pathname);

  if (!matches || matches.length === 0) return;

  return {
    pathname: matches[0].pathname,
    search: url.searchParams.toString(),
  };
};
