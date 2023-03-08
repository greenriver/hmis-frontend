import * as Sentry from '@sentry/react';
import { Suspense } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { DashboardRoutes, Routes } from './routes';

import EditClient from '@/components/dashboard/EditClient';
import AllAssessments from '@/components/dashboard/enrollments/AllAssessments';
import AllEnrollments from '@/components/dashboard/enrollments/AllEnrollments';
import AssessmentPage from '@/components/dashboard/enrollments/AssessmentPage';
import EditHousehold from '@/components/dashboard/enrollments/EditHousehold';
import HouseholdExit from '@/components/dashboard/enrollments/HouseholdExit';
import HouseholdIntake from '@/components/dashboard/enrollments/HouseholdIntake';
import NewEnrollment from '@/components/dashboard/enrollments/NewEnrollment';
import ViewEnrollment from '@/components/dashboard/enrollments/ViewEnrollment';
import Profile from '@/components/dashboard/Profile';
import { fullPageErrorFallback } from '@/components/elements/ErrorFallback';
import Loading from '@/components/elements/Loading';
import MainLayout from '@/components/layout/MainLayout';
import NotFound from '@/components/pages/404';
import AllProjects from '@/components/pages/AllProjects';
import AddServices from '@/components/pages/BulkAddServices';
import ClientDashboard from '@/components/pages/ClientDashboard';
import ClientRoute from '@/components/pages/ClientRoute';
import CreateClient from '@/components/pages/CreateClient';
import CreateOrganization from '@/components/pages/CreateOrganization';
import CreateProject from '@/components/pages/CreateProject';
import Dashboard from '@/components/pages/Dashboard';
import EditOrganization from '@/components/pages/EditOrganization';
import EditProject from '@/components/pages/EditProject';
import Funder from '@/components/pages/Funder';
import Inventory from '@/components/pages/Inventory';
import InventoryBeds from '@/components/pages/InventoryBeds';
import Organization from '@/components/pages/Organization';
import OrganizationEditRoute from '@/components/pages/OrganizationEditRoute';
import Project from '@/components/pages/Project';
import ProjectCoc from '@/components/pages/ProjectCoc';
import ProjectEditRoute from '@/components/pages/ProjectEditRoute';
import Service from '@/components/pages/Service';
import { RootPermissionsFilter } from '@/modules/permissions/PermissionsFilters';

const App = () => {
  return (
    <MainLayout>
      <Suspense fallback={<Loading />}>
        <Sentry.ErrorBoundary fallback={fullPageErrorFallback}>
          <Outlet />
        </Sentry.ErrorBoundary>
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
      {
        path: Routes.EDIT_PROJECT,
        element: (
          <ProjectEditRoute>
            <EditProject />
          </ProjectEditRoute>
        ),
      },
      { path: Routes.CREATE_PROJECT, element: <CreateProject /> },
      { path: Routes.ORGANIZATION, element: <Organization /> },
      {
        path: Routes.EDIT_ORGANIZATION,
        element: (
          <OrganizationEditRoute>
            <EditOrganization />
          </OrganizationEditRoute>
        ),
      },
      {
        path: Routes.NEW_INVENTORY,
        element: (
          <ProjectEditRoute>
            <Inventory create />
          </ProjectEditRoute>
        ),
      },
      {
        path: Routes.EDIT_INVENTORY,
        element: (
          <ProjectEditRoute>
            <Inventory />
          </ProjectEditRoute>
        ),
      },
      {
        path: Routes.MANAGE_INVENTORY_BEDS,
        element: (
          <ProjectEditRoute>
            <InventoryBeds />
          </ProjectEditRoute>
        ),
      },
      {
        path: Routes.NEW_FUNDER,
        element: (
          <ProjectEditRoute>
            <Funder create={true} />
          </ProjectEditRoute>
        ),
      },
      {
        path: Routes.EDIT_FUNDER,
        element: (
          <ProjectEditRoute>
            <Funder />
          </ProjectEditRoute>
        ),
      },
      {
        path: Routes.NEW_COC,
        element: (
          <ProjectEditRoute>
            <ProjectCoc create />
          </ProjectEditRoute>
        ),
      },
      {
        path: Routes.EDIT_COC,
        element: (
          <ProjectEditRoute>
            <ProjectCoc />
          </ProjectEditRoute>
        ),
      },
      {
        path: Routes.ADD_SERVICES,
        element: (
          <RootPermissionsFilter permissions='canEditEnrollments'>
            <AddServices />
          </RootPermissionsFilter>
        ),
      },
      {
        path: Routes.CREATE_ORGANIZATION,
        element: (
          <RootPermissionsFilter permissions='canEditOrganization'>
            <CreateOrganization />
          </RootPermissionsFilter>
        ),
      },
      {
        path: Routes.CREATE_CLIENT,
        element: (
          <ClientRoute edit>
            <CreateClient />
          </ClientRoute>
        ),
      },
      {
        path: Routes.CLIENT_DASHBOARD,
        element: (
          <ClientRoute view>
            <ClientDashboard />
          </ClientRoute>
        ),
        children: [
          { path: '', element: <Navigate to='profile' replace /> },
          { path: DashboardRoutes.PROFILE, element: <Profile /> },
          {
            path: DashboardRoutes.EDIT,
            element: (
              <RootPermissionsFilter
                permissions='canEditClients'
                otherwise={<Navigate to='profile' replace />}
              >
                <EditClient />
              </RootPermissionsFilter>
            ),
          },
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
            path: DashboardRoutes.HOUSEHOLD_EXIT,
            element: <HouseholdExit />,
          },
          {
            path: DashboardRoutes.HOUSEHOLD_INTAKE,
            element: <HouseholdIntake />,
          },
          {
            path: DashboardRoutes.NEW_ASSESSMENT,
            element: <AssessmentPage />,
          },
          {
            path: DashboardRoutes.VIEW_ASSESSMENT,
            element: <AssessmentPage />,
          },
          {
            path: DashboardRoutes.EDIT_ASSESSMENT,
            element: <AssessmentPage />,
          },
          {
            path: DashboardRoutes.NEW_SERVICE,
            element: <Service create />,
          },
          {
            path: DashboardRoutes.EDIT_SERVICE,
            element: <Service />,
          },
          {
            path: DashboardRoutes.ALL_ENROLLMENTS,
            element: <AllEnrollments />,
          },
          { path: DashboardRoutes.HISTORY, element: null },
          { path: DashboardRoutes.ASSESSMENTS, element: <AllAssessments /> },
          { path: DashboardRoutes.NOTES, element: null },
          { path: DashboardRoutes.FILES, element: null },
          { path: DashboardRoutes.CONTACT, element: null },
          { path: DashboardRoutes.LOCATIONS, element: null },
          { path: DashboardRoutes.REFERRALS, element: null },
          { path: '*', element: <Navigate to='profile' replace /> },
        ],
      },
      { path: '/', element: <Dashboard /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];
