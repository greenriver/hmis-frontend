import React, { Suspense, lazy } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import Loading from '@/components/elements/Loading';
import MainLayout from '@/components/layout/MainLayout';

const Dashboard = lazy(() => import('@/components/pages/Dashboard'));
const Intake = lazy(() => import('@/components/pages/Intake'));

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
