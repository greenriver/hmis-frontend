import { useEffect, useMemo } from 'react';
import {
  Navigate,
  RouteObject,
  useLocation,
  useNavigate,
  useRoutes,
} from 'react-router-dom';

import { STATE_FROM_LOGIN_REDIRECT } from '../utils/routeUtil';
import { protectedRoutes } from './protectedRoutes';

import PathHandler from '@/components/elements/PathHandler';
import { HmisUser } from '@/modules/auth/api/sessions';
import Login from '@/modules/auth/components/Login';
import SessionStatusManager from '@/modules/auth/components/SessionStatusManager';
import useAuth from '@/modules/auth/hooks/useAuth';
import useSessionStatus from '@/modules/auth/hooks/useSessionStatus';
import SystemStatus from '@/modules/systemStatus/components/SystemStatus';

const REQUESTED_PATH_KEY = 'hmis_requested_path';

// deny-list for urls that can be redirected to after sign-in
function pathForRedirect(arg: string): string | undefined {
  const path = arg.trim();
  return path === '/' ? undefined : path;
}

const PublicRoutes: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    const normalizedPath = pathForRedirect(pathname);
    if (normalizedPath) {
      sessionStorage.setItem(REQUESTED_PATH_KEY, normalizedPath);
    } else {
      sessionStorage.removeItem(REQUESTED_PATH_KEY);
    }
    // ignore pathname dependency. We only want to run this once, otherwise it will clear stored path
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const publicRoutes = useMemo<RouteObject[]>(() => {
    return [
      {
        path: '/system_status/:detailType',
        element: <SystemStatus />,
      },
      {
        path: '/',
        element: <Login />,
      },
      {
        path: '*',
        element: (
          <PathHandler>
            <Navigate to='/' />
          </PathHandler>
        ),
      },
    ];
  }, []);
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

  const navigate = useNavigate();
  useEffect(() => {
    const path = sessionStorage.getItem(REQUESTED_PATH_KEY);
    if (path) {
      sessionStorage.removeItem(REQUESTED_PATH_KEY);
      navigate(path, { state: STATE_FROM_LOGIN_REDIRECT });
    }
  }, [navigate]);

  return (
    <>
      <SessionStatusManager {...sessionStatus} />
      {useRoutes(
        sessionStatus.status === 'valid' ? protectedRoutes : blankRoutes
      )}
    </>
  );
};

const AppRoutes = () => {
  const { user } = useAuth();

  return user ? <ProtectedRoutes user={user} /> : <PublicRoutes />;
};

export default AppRoutes;
