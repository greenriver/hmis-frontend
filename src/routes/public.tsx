// import { lazyImport } from '@/utils/lazyImport';

// const { AuthRoutes } = lazyImport(() => import('@/features/auth'), 'AuthRoutes');

export const publicRoutes = [
  {
    path: '/auth/*',
    element: <div>log in</div>,
    // element: <AuthRoutes />,
  },
];
