import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Navigate, Outlet } from 'react-router-dom';

import { Routes, DashboardRoutes } from './routes';

import AllEnrollments from '@/components/dashboard/enrollments/AllEnrollments';
import EditHousehold from '@/components/dashboard/enrollments/EditHousehold';
import NewAssessment from '@/components/dashboard/enrollments/NewAssessment';
import NewEnrollment from '@/components/dashboard/enrollments/NewEnrollment';
import ViewAssessment from '@/components/dashboard/enrollments/ViewAssessment';
import ViewEnrollment from '@/components/dashboard/enrollments/ViewEnrollment';
import Profile from '@/components/dashboard/Profile';
import ErrorFallback from '@/components/elements/ErrorFallback';
import Loading from '@/components/elements/Loading';
import MainLayout from '@/components/layout/MainLayout';
import AllProjects from '@/components/pages/AllProjects';
import ClientDashboard from '@/components/pages/ClientDashboard';
import CreateClient from '@/components/pages/CreateClient';
import Dashboard from '@/components/pages/Dashboard';
import EditOrganization from '@/components/pages/EditOrganization';
import EditProject from '@/components/pages/EditProject';
import Organization from '@/components/pages/Organization';
import Project from '@/components/pages/Project';

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
      { path: Routes.ALL_PROJECTS, element: <AllProjects /> },
      { path: Routes.PROJECT, element: <Project /> },
      { path: Routes.EDIT_PROJECT, element: <EditProject /> },
      { path: Routes.ORGANIZATION, element: <Organization /> },
      { path: Routes.EDIT_ORGANIZATION, element: <EditOrganization /> },
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
            path: DashboardRoutes.EDIT_HOUSEHOLD,
            element: <EditHousehold />,
          },
          {
            path: DashboardRoutes.NEW_ASSESSMENT,
            element: <NewAssessment />,
          },
          {
            path: DashboardRoutes.VIEW_ASSESSMENT,
            element: <ViewAssessment />,
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
