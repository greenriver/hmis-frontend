import { RouteObject, useRoutes } from 'react-router-dom';

import { protectedRoutes } from './protected';
import { publicRoutes } from './public';

import useAuth from '@/modules/auth/hooks/useAuth';

export const AppRoutes = () => {
  const { user } = useAuth();
  const routes = user === undefined ? publicRoutes : protectedRoutes;
  const element = useRoutes([...routes] as RouteObject[]);
  return <>{element}</>;
};
