import { RouteObject, useRoutes } from 'react-router-dom';

// import { Landing } from '@/features/misc';
// import { useAuth } from '@/lib/auth';

import { protectedRoutes } from './protected';
import { publicRoutes } from './public';

export const AppRoutes = () => {
  // const auth = useAuth();

  const commonRoutes = [{ path: '/', element: <div>Hello world</div> }];

  const routes = [...protectedRoutes, publicRoutes]; // FIXME only protect routes if logged in

  const element = useRoutes([...routes, ...commonRoutes] as RouteObject[]);

  return <>{element}</>;
};
