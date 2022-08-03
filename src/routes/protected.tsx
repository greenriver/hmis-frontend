import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Navigate, Outlet } from 'react-router-dom';

import { Routes, DashboardRoutes } from './routes';

import AllEnrollments from '@/components/dashboard/enrollments/AllEnrollments';
import NewEnrollment from '@/components/dashboard/enrollments/NewEnrollment';
import ViewEnrollment from '@/components/dashboard/enrollments/ViewEnrollment';
import Profile from '@/components/dashboard/Profile';
import ErrorFallback from '@/components/elements/ErrorFallback';
import Loading from '@/components/elements/Loading';
import MainLayout from '@/components/layout/MainLayout';
import ClientDashboard from '@/components/pages/ClientDashboard';
import CreateClient from '@/components/pages/CreateClient';
import Dashboard from '@/components/pages/Dashboard';

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
      { path: Routes.CREATE_CLIENT, element: <CreateClient /> },
      {
        path: Routes.CLIENT_DASHBOARD,
        element: <ClientDashboard />,
        children: [
          { path: '', element: <Profile /> },
          { path: DashboardRoutes.PROFILE, element: <Profile /> },
          {
            path: DashboardRoutes.NEW_ENROLLMENT,
            element: <NewEnrollment />,
          },
          {
            path: DashboardRoutes.VIEW_ENROLLMENT,
            element: <ViewEnrollment />,
          },
          {
            path: DashboardRoutes.ALL_ENROLLMENTS,
            element: <AllEnrollments />,
          },

          { path: DashboardRoutes.HISTORY, element: null },
          { path: DashboardRoutes.ASSESSMENTS, element: null },
          { path: DashboardRoutes.NOTES, element: null },
          { path: DashboardRoutes.FILES, element: null },
          { path: DashboardRoutes.CONTACT, element: null },
          { path: DashboardRoutes.LOCATIONS, element: null },
          { path: DashboardRoutes.REFERRALS, element: null },
        ],
      },
      { path: '/', element: <Dashboard /> },
      { path: '*', element: <Navigate to='.' /> },
    ],
  },
];
