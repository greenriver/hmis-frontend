import { useMemo } from 'react';
import {
  Navigate,
  RouteObject,
  useLocation,
  useRoutes,
} from 'react-router-dom';

import { protectedRoutes } from './protected';

import Login from '@/modules/auth/components/Login';
import useAuth, { RouteLocationState } from '@/modules/auth/hooks/useAuth';

export const AppRoutes = () => {
  const { pathname, state } = useLocation();
  const { user } = useAuth();

  const publicRoutes = useMemo(() => {
    // Pass current pathname as "prev" so we can redirect to the previous
    // page after a successful login.
    // In some cases we don't want to do that (e.g. after "Sign Out" is clicked), we use the 'clearPrev' flag for that.
    const navigationState = (state as RouteLocationState)?.clearPrev
      ? null
      : { prev: pathname };
    return [
      {
        path: '/',
        element: <Login />,
      },
      {
        path: '*',
        element: <Navigate to='/' state={navigationState} />,
      },
    ];
  }, [state, pathname]);

  const routes = user ? protectedRoutes : publicRoutes;
  const element = useRoutes([...routes] as RouteObject[]);
  return <>{element}</>;
};
