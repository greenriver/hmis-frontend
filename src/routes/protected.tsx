import * as Sentry from '@sentry/react';
import { Suspense } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { DashboardRoutes, Routes } from './routes';

import AllFiles from '@/components/dashboard/AllFiles';
import AuditHistory from '@/components/dashboard/AuditHistory';
import EditClient from '@/components/dashboard/EditClient';
import AllAssessments from '@/components/dashboard/enrollments/AllAssessments';
import AllEnrollments from '@/components/dashboard/enrollments/AllEnrollments';
import EditAssessmentPage from '@/components/dashboard/enrollments/EditAssessmentPage';
import EditHousehold from '@/components/dashboard/enrollments/EditHousehold';
import HouseholdExit from '@/components/dashboard/enrollments/HouseholdExit';
import HouseholdIntake from '@/components/dashboard/enrollments/HouseholdIntake';
import NewEnrollment from '@/components/dashboard/enrollments/NewEnrollment';
import ViewAssessmentPage from '@/components/dashboard/enrollments/ViewAssessmentPage';
import ViewEnrollment from '@/components/dashboard/enrollments/ViewEnrollment';
import Profile from '@/components/dashboard/Profile';
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
import EnrollmentsRoute from '@/components/pages/EnrollmentRoute';
import File from '@/components/pages/File';
import FileEditRoute from '@/components/pages/FileEditRoute';
import Funder from '@/components/pages/Funder';
import Inventory from '@/components/pages/Inventory';
import InventoryBeds from '@/components/pages/InventoryBeds';
import Organization from '@/components/pages/Organization';
import OrganizationEditRoute from '@/components/pages/OrganizationEditRoute';
import Project from '@/components/pages/Project';
import ProjectCoc from '@/components/pages/ProjectCoc';
import ProjectEditRoute from '@/components/pages/ProjectEditRoute';
import Service from '@/components/pages/Service';
import useSafeParams from '@/hooks/useSafeParams';
import { fullPageErrorFallback } from '@/modules/errors/components/ErrorFallback';
import {
  ClientPermissionsFilter,
  RootPermissionsFilter,
} from '@/modules/permissions/PermissionsFilters';
import generateSafePath from '@/utils/generateSafePath';

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

const ParamsWrapper = <T extends { [x: string]: string } = any>({
  children,
}: {
  children: (params: T) => JSX.Element;
}): JSX.Element => {
  const params = useSafeParams() as T;
  return children(params);
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
      {
        path: Routes.CREATE_PROJECT,
        element: (
          <RootPermissionsFilter permissions={['canEditProjectDetails']}>
            <CreateProject />
          </RootPermissionsFilter>
        ),
      },
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
          <ProjectEditRoute
            permissions={['canEditEnrollments']}
            redirectRoute={Routes.PROJECT}
          >
            <AddServices />
          </ProjectEditRoute>
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
          {
            path: DashboardRoutes.PROFILE,
            element: (
              <ClientRoute view>
                <Profile />
              </ClientRoute>
            ),
          },
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
            element: (
              <EnrollmentsRoute
                edit
                redirectRoute={DashboardRoutes.ALL_ENROLLMENTS}
              >
                <NewEnrollment />
              </EnrollmentsRoute>
            ),
          },
          {
            path: DashboardRoutes.VIEW_ENROLLMENT,
            element: (
              <EnrollmentsRoute view redirectRoute={DashboardRoutes.PROFILE}>
                <ViewEnrollment />
              </EnrollmentsRoute>
            ),
          },
          {
            path: DashboardRoutes.EDIT_HOUSEHOLD,
            element: (
              <EnrollmentsRoute
                edit
                redirectRoute={DashboardRoutes.VIEW_ENROLLMENT}
              >
                <EditHousehold />
              </EnrollmentsRoute>
            ),
          },
          {
            path: DashboardRoutes.HOUSEHOLD_EXIT,
            element: (
              <EnrollmentsRoute
                edit
                redirectRoute={DashboardRoutes.VIEW_ENROLLMENT}
              >
                <HouseholdExit />
              </EnrollmentsRoute>
            ),
          },
          {
            path: DashboardRoutes.HOUSEHOLD_INTAKE,
            element: (
              <EnrollmentsRoute
                edit
                redirectRoute={DashboardRoutes.VIEW_ENROLLMENT}
              >
                <HouseholdIntake />
              </EnrollmentsRoute>
            ),
          },
          {
            path: DashboardRoutes.NEW_ASSESSMENT,
            element: (
              <EnrollmentsRoute
                edit
                redirectRoute={DashboardRoutes.VIEW_ENROLLMENT}
              >
                <EditAssessmentPage />
              </EnrollmentsRoute>
            ),
          },
          {
            path: DashboardRoutes.VIEW_ASSESSMENT,
            element: (
              <EnrollmentsRoute view redirectRoute={DashboardRoutes.PROFILE}>
                <ViewAssessmentPage />
              </EnrollmentsRoute>
            ),
          },
          {
            path: DashboardRoutes.EDIT_ASSESSMENT,
            element: (
              <EnrollmentsRoute
                edit
                redirectRoute={DashboardRoutes.VIEW_ENROLLMENT}
              >
                <EditAssessmentPage />
              </EnrollmentsRoute>
            ),
          },
          {
            path: DashboardRoutes.NEW_SERVICE,
            element: (
              <EnrollmentsRoute
                edit
                redirectRoute={DashboardRoutes.VIEW_ENROLLMENT}
              >
                <Service create />
              </EnrollmentsRoute>
            ),
          },
          {
            path: DashboardRoutes.EDIT_SERVICE,
            element: (
              <EnrollmentsRoute
                edit
                redirectRoute={DashboardRoutes.VIEW_ENROLLMENT}
              >
                <Service />
              </EnrollmentsRoute>
            ),
          },
          {
            path: DashboardRoutes.ALL_ENROLLMENTS,
            element: (
              <EnrollmentsRoute view redirectRoute={DashboardRoutes.PROFILE}>
                <AllEnrollments />
              </EnrollmentsRoute>
            ),
          },
          {
            path: DashboardRoutes.AUDIT_HISTORY,
            element: (
              <RootPermissionsFilter
                permissions='canAuditClients'
                otherwise={<Navigate to='profile' replace />}
              >
                <AuditHistory />
              </RootPermissionsFilter>
            ),
          },
          {
            path: DashboardRoutes.ASSESSMENTS,
            element: (
              <EnrollmentsRoute view redirectRoute={DashboardRoutes.PROFILE}>
                <AllAssessments />
              </EnrollmentsRoute>
            ),
          },
          { path: DashboardRoutes.NOTES, element: null },
          {
            path: DashboardRoutes.FILES,
            element: (
              <ParamsWrapper<{ clientId: string }>>
                {({ clientId }) => (
                  <ClientPermissionsFilter
                    id={clientId}
                    permissions={[
                      'canViewAnyConfidentialClientFiles',
                      'canViewAnyNonconfidentialClientFiles',
                    ]}
                    otherwise={
                      <Navigate
                        to={generateSafePath(DashboardRoutes.PROFILE, {
                          clientId,
                        })}
                        replace
                      />
                    }
                  >
                    <AllFiles />
                  </ClientPermissionsFilter>
                )}
              </ParamsWrapper>
            ),
          },
          {
            path: DashboardRoutes.NEW_FILE,
            element: (
              <FileEditRoute create>
                <File create />
              </FileEditRoute>
            ),
          },
          {
            path: DashboardRoutes.EDIT_FILE,
            element: (
              <FileEditRoute>
                <File />
              </FileEditRoute>
            ),
          },
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
