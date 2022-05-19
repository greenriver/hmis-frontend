import { Suspense } from 'react';
import { Navigate } from 'react-router-dom';

// import { Spinner } from '@/components/Elements';
import { MainLayout } from '@/components/Layout';
// import { lazyImport } from '@/utils/lazyImport';

// const { DiscussionsRoutes } = lazyImport(
//   () => import('@/features/discussions'),
//   'DiscussionsRoutes'
// );
// const { Dashboard } = lazyImport(() => import('@/features/misc'), 'Dashboard');
// const { Profile } = lazyImport(() => import('@/features/users'), 'Profile');
// const { Users } = lazyImport(() => import('@/features/users'), 'Users');

const App = () => {
  return (
    <MainLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <div>hello world</div>
      </Suspense>
    </MainLayout>
  );
};

export const protectedRoutes = [
  {
    path: '/',
    element: <App />,
    children: [
      // { path: '/discussions/*', element: <DiscussionsRoutes /> },
      // { path: '/users', element: <Users /> },
      // { path: '/profile', element: <Profile /> },
      // { path: '/', element: <Dashboard /> },
      { path: '*', element: <Navigate to='.' /> },
    ],
  },
];
