import { useMemo } from 'react';
import {
  Navigate,
  RouteObject,
  useLocation,
  useRoutes,
} from 'react-router-dom';

import { protectedRoutes } from './protected';

import { HmisUser } from '@/modules/auth/api/sessions';
import Login from '@/modules/auth/components/Login';
import SessionStatusManager from '@/modules/auth/components/Session/SessionStatusManager';
import useSessionStatus from '@/modules/auth/components/Session/useSessionStatus';
import useAuth from '@/modules/auth/hooks/useAuth';
import { RouteLocationState } from '@/modules/hmisAppSettings/types';

const PublicRoutes: React.FC = () => {
  const { pathname, state } = useLocation();

  const publicRoutes = useMemo<RouteObject[]>(() => {
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
  return useRoutes(publicRoutes);
};

const blankRoutes: RouteObject[] = [
  {
    path: '*',
    element: <></>,
  },
];

const ProtectedRoutes: React.FC<{ user: HmisUser }> = ({ user }) => {
  // const promptToExtendBefore = 60 * 5;
  const promptToExtendBefore = 15;
  const sessionStatus = useSessionStatus({
    initialUser: user,
    promptToExtendBefore,
  });

  return (
    <>
      <SessionStatusManager {...sessionStatus} />
      {useRoutes(
        sessionStatus.status == 'valid' ? protectedRoutes : blankRoutes
      )}
    </>
  );
};

const AppRoutes = () => {
  const { user } = useAuth();

  return user ? <ProtectedRoutes user={user} /> : <PublicRoutes />;
};

export default AppRoutes;
