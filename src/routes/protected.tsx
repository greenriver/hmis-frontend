import { Suspense } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import Loading from '@/components/elements/Loading';
import MainLayout from '@/components/layout/MainLayout';
import Dashboard from '@/components/pages/Dashboard';
import Intake from '@/components/pages/Intake';

const App = () => {
  return (
    <MainLayout>
      <Suspense fallback={<Loading />}>
        <Outlet />
      </Suspense>
    </MainLayout>
  );
};

export const protectedRoutes = [
  {
    path: '/',
    element: <App />,
    children: [
      { path: '/intake', element: <Intake /> },
      { path: '/', element: <Dashboard /> },
      { path: '*', element: <Navigate to='.' /> },
    ],
  },
];
