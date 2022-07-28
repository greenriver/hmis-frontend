import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Navigate, Outlet } from 'react-router-dom';

import Enrollments from '@/components/dashboard/Enrollments';
import Profile from '@/components/dashboard/Profile';
import ErrorFallback from '@/components/elements/ErrorFallback';
import Loading from '@/components/elements/Loading';
import MainLayout from '@/components/layout/MainLayout';
import ClientDashboard from '@/components/pages/ClientDashboard';

const Dashboard = lazy(() => import('@/components/pages/Dashboard'));
const Intake = lazy(() => import('@/components/pages/Intake'));

const App = () => {
  return (
    <MainLayout>
      <Suspense fallback={<Loading />}>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Outlet />
        </ErrorBoundary>
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
      {
        path: '/client/:clientId',
        element: <ClientDashboard />,
        children: [
          { path: '', element: <Profile /> },
          { path: 'profile', element: <Profile /> },
          { path: 'enrollments', element: <Enrollments /> },
          { path: 'history', element: null },
          { path: 'assessments', element: null },
          { path: 'notes', element: null },
          { path: 'files', element: null },
          { path: 'contact', element: null },
          { path: 'locations', element: null },
          { path: 'referrals', element: null },
        ],
      },
      { path: '/', element: <Dashboard /> },
      { path: '*', element: <Navigate to='.' /> },
    ],
  },
];
