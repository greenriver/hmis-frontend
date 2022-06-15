// import { lazyImport } from '@/utils/lazyImport';
import Login from '@/components/Login';
// const { AuthRoutes } = lazyImport(() => import('@/features/auth'), 'AuthRoutes');

export const publicRoutes = [
  {
    path: '/',
    element: <Login />,
    // element: <AuthRoutes />,
  },
];
