import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Navigate, Outlet } from 'react-router-dom';

import ErrorFallback from '@/components/elements/ErrorFallback';
import Loading from '@/components/elements/Loading';
import MainLayout from '@/components/layout/MainLayout';
import ClientDashboard from '@/components/pages/ClientDashboard';
import EnrollmentPage from '@/components/pages/EnrollmentPage';

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
      { path: '/client/:clientId', element: <ClientDashboard /> },
      {
        path: '/client/:clientId/enrollment/:enrollmentId',
        element: <EnrollmentPage />,
      },
      { path: '/', element: <Dashboard /> },
      { path: '*', element: <Navigate to='.' /> },
    ],
  },
];
