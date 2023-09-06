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
import SessionStatusManager from '@/modules/auth/components/SessionStatusManager';
import useAuth from '@/modules/auth/hooks/useAuth';
import useSessionStatus from '@/modules/auth/hooks/useSessionStatus';
import SystemStatus from '@/modules/systemStatus/components/SystemStatus';

export interface RouteLocationState {
  /** Previous pathname, so we can redirect to it when logging back in */
  prev?: string;
  /** Whether to clear/ignore the previous pathname. For example when someone clicks "Sign Out," the previous location shouldn't be maintained when they log back
  in.  */
  clearPrev?: boolean;
}

const SystemStatusRoute = {
  path: '/system_status/:detailType',
  element: <SystemStatus />,
};

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
      SystemStatusRoute,
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
  const promptToExtendBefore = 60 * 5; // prompt when only 5 minutes left
  const sessionStatus = useSessionStatus({
    initialUser: user,
    promptToExtendBefore,
  });

  return (
    <>
      <SessionStatusManager {...sessionStatus} />
      {useRoutes(
        sessionStatus.status == 'valid'
          ? [...protectedRoutes, SystemStatusRoute]
          : blankRoutes
      )}
    </>
  );
};

const AppRoutes = () => {
  const { user } = useAuth();

  return user ? <ProtectedRoutes user={user} /> : <PublicRoutes />;
};

export default AppRoutes;
