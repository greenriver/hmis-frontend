import { Suspense } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import {
  ClientDashboardRoutes,
  ProjectDashboardRoutes,
  Routes,
} from './routes';

import AllFiles from '@/components/clientDashboard/AllFiles';
import AuditHistory from '@/components/clientDashboard/AuditHistory';
import EditClient from '@/components/clientDashboard/EditClient';
import AllAssessments from '@/components/clientDashboard/enrollments/AllAssessments';
import AllEnrollments from '@/components/clientDashboard/enrollments/AllEnrollments';
import EditHousehold from '@/components/clientDashboard/enrollments/EditHousehold';
import HouseholdExit from '@/components/clientDashboard/enrollments/HouseholdExit';
import HouseholdIntake from '@/components/clientDashboard/enrollments/HouseholdIntake';
import NewAssessmentPage from '@/components/clientDashboard/enrollments/NewAssessmentPage';
import NewEnrollment from '@/components/clientDashboard/enrollments/NewEnrollment';
import ViewAssessmentPage from '@/components/clientDashboard/enrollments/ViewAssessmentPage';
import ViewEnrollment from '@/components/clientDashboard/enrollments/ViewEnrollment';
import Profile from '@/components/clientDashboard/Profile';
import Loading from '@/components/elements/Loading';
import MainLayout from '@/components/layout/MainLayout';
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
import NotFound from '@/components/pages/NotFound';
import Organization from '@/components/pages/Organization';
import OrganizationEditRoute from '@/components/pages/OrganizationEditRoute';
import Project from '@/components/pages/Project';
import ProjectCoc from '@/components/pages/ProjectCoc';
import ProjectDashboard from '@/components/pages/ProjectDashboard';
import ProjectEditRoute from '@/components/pages/ProjectEditRoute';
import Service from '@/components/pages/Service';
import useSafeParams from '@/hooks/useSafeParams';
import SentryErrorBoundary from '@/modules/errors/components/SentryErrorBoundary';
import Cocs from '@/modules/inventory/components/Cocs';
import Funders from '@/modules/inventory/components/Funders';
import Inventories from '@/modules/inventory/components/Inventories';
import ProjectEnrollments from '@/modules/inventory/components/ProjectEnrollments';
import ProjectReferrals from '@/modules/inventory/components/ProjectReferrals';
import {
  ClientPermissionsFilter,
  RootPermissionsFilter,
} from '@/modules/permissions/PermissionsFilters';
import generateSafePath from '@/utils/generateSafePath';

const App = () => {
  return (
    <MainLayout>
      <Suspense fallback={<Loading />}>
        <SentryErrorBoundary fullpage>
          <Outlet />
        </SentryErrorBoundary>
      </Suspense>
    </MainLayout>
  );
};

const InternalError: React.FC = () => {
  throw new Error('This is a test error');
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
      {
        path: Routes.PROJECT,
        element: <ProjectDashboard />,
        children: [
          { path: '', element: <Navigate to='overview' replace /> },
          {
            path: ProjectDashboardRoutes.OVERVIEW,
            element: <Project />,
          },
          {
            path: ProjectDashboardRoutes.ENROLLMENTS,
            element: <ProjectEnrollments />,
          },
          {
            path: ProjectDashboardRoutes.REFERRALS,
            element: <ProjectReferrals />,
          },
          {
            path: ProjectDashboardRoutes.EDIT_PROJECT,
            element: (
              <ProjectEditRoute>
                <EditProject />
              </ProjectEditRoute>
            ),
          },
          {
            path: ProjectDashboardRoutes.INVENTORY,
            element: <Inventories />,
          },
          {
            path: ProjectDashboardRoutes.NEW_INVENTORY,
            element: (
              <ProjectEditRoute>
                <Inventory create />
              </ProjectEditRoute>
            ),
          },
          {
            path: ProjectDashboardRoutes.EDIT_INVENTORY,
            element: (
              <ProjectEditRoute>
                <Inventory />
              </ProjectEditRoute>
            ),
          },
          {
            path: ProjectDashboardRoutes.MANAGE_INVENTORY_BEDS,
            element: (
              <ProjectEditRoute>
                <InventoryBeds />
              </ProjectEditRoute>
            ),
          },
          {
            path: ProjectDashboardRoutes.FUNDERS,
            element: <Funders />,
          },
          {
            path: ProjectDashboardRoutes.NEW_FUNDER,
            element: (
              <ProjectEditRoute>
                <Funder create={true} />
              </ProjectEditRoute>
            ),
          },
          {
            path: ProjectDashboardRoutes.EDIT_FUNDER,
            element: (
              <ProjectEditRoute>
                <Funder />
              </ProjectEditRoute>
            ),
          },
          {
            path: ProjectDashboardRoutes.COCS,
            element: <Cocs />,
          },
          {
            path: ProjectDashboardRoutes.NEW_COC,
            element: (
              <ProjectEditRoute>
                <ProjectCoc create />
              </ProjectEditRoute>
            ),
          },
          {
            path: ProjectDashboardRoutes.EDIT_COC,
            element: (
              <ProjectEditRoute>
                <ProjectCoc />
              </ProjectEditRoute>
            ),
          },
          {
            path: ProjectDashboardRoutes.ADD_SERVICES,
            element: (
              <ProjectEditRoute
                permissions={['canEditEnrollments']}
                redirectRoute={Routes.PROJECT}
              >
                <AddServices />
              </ProjectEditRoute>
            ),
          },
        ],
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
            path: ClientDashboardRoutes.PROFILE,
            element: (
              <ClientRoute view>
                <Profile />
              </ClientRoute>
            ),
          },
          {
            path: ClientDashboardRoutes.EDIT,
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
            path: ClientDashboardRoutes.NEW_ENROLLMENT,
            element: (
              <EnrollmentsRoute
                edit
                redirectRoute={ClientDashboardRoutes.ALL_ENROLLMENTS}
              >
                <NewEnrollment />
              </EnrollmentsRoute>
            ),
          },
          {
            path: ClientDashboardRoutes.VIEW_ENROLLMENT,
            element: (
              <EnrollmentsRoute
                view
                redirectRoute={ClientDashboardRoutes.PROFILE}
              >
                <ViewEnrollment />
              </EnrollmentsRoute>
            ),
          },
          {
            path: ClientDashboardRoutes.EDIT_HOUSEHOLD,
            element: (
              <EnrollmentsRoute
                edit
                redirectRoute={ClientDashboardRoutes.VIEW_ENROLLMENT}
              >
                <EditHousehold />
              </EnrollmentsRoute>
            ),
          },
          {
            path: ClientDashboardRoutes.HOUSEHOLD_EXIT,
            element: (
              <EnrollmentsRoute
                edit
                redirectRoute={ClientDashboardRoutes.VIEW_ENROLLMENT}
              >
                <HouseholdExit />
              </EnrollmentsRoute>
            ),
          },
          {
            path: ClientDashboardRoutes.HOUSEHOLD_INTAKE,
            element: (
              <EnrollmentsRoute
                edit
                redirectRoute={ClientDashboardRoutes.VIEW_ENROLLMENT}
              >
                <HouseholdIntake />
              </EnrollmentsRoute>
            ),
          },
          {
            path: ClientDashboardRoutes.NEW_ASSESSMENT,
            element: (
              <EnrollmentsRoute
                edit
                redirectRoute={ClientDashboardRoutes.VIEW_ENROLLMENT}
              >
                <NewAssessmentPage />
              </EnrollmentsRoute>
            ),
          },
          {
            path: ClientDashboardRoutes.VIEW_ASSESSMENT,
            element: (
              <EnrollmentsRoute
                view
                redirectRoute={ClientDashboardRoutes.PROFILE}
              >
                <ViewAssessmentPage />
              </EnrollmentsRoute>
            ),
          },
          {
            path: ClientDashboardRoutes.NEW_SERVICE,
            element: (
              <EnrollmentsRoute
                edit
                redirectRoute={ClientDashboardRoutes.VIEW_ENROLLMENT}
              >
                <Service create />
              </EnrollmentsRoute>
            ),
          },
          {
            path: ClientDashboardRoutes.EDIT_SERVICE,
            element: (
              <EnrollmentsRoute
                edit
                redirectRoute={ClientDashboardRoutes.VIEW_ENROLLMENT}
              >
                <Service />
              </EnrollmentsRoute>
            ),
          },
          {
            path: ClientDashboardRoutes.ALL_ENROLLMENTS,
            element: (
              <EnrollmentsRoute
                view
                redirectRoute={ClientDashboardRoutes.PROFILE}
              >
                <AllEnrollments />
              </EnrollmentsRoute>
            ),
          },
          {
            path: ClientDashboardRoutes.AUDIT_HISTORY,
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
            path: ClientDashboardRoutes.ASSESSMENTS,
            element: (
              <EnrollmentsRoute
                view
                redirectRoute={ClientDashboardRoutes.PROFILE}
              >
                <AllAssessments />
              </EnrollmentsRoute>
            ),
          },
          { path: ClientDashboardRoutes.NOTES, element: null },
          {
            path: ClientDashboardRoutes.FILES,
            element: (
              <ParamsWrapper<{ clientId: string }>>
                {({ clientId }) => (
                  <ClientPermissionsFilter
                    id={clientId}
                    permissions={[
                      'canViewAnyConfidentialClientFiles',
                      'canViewAnyNonconfidentialClientFiles',
                      'canManageOwnClientFiles',
                    ]}
                    otherwise={
                      <Navigate
                        to={generateSafePath(ClientDashboardRoutes.PROFILE, {
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
            path: ClientDashboardRoutes.NEW_FILE,
            element: (
              <FileEditRoute create>
                <File create />
              </FileEditRoute>
            ),
          },
          {
            path: ClientDashboardRoutes.EDIT_FILE,
            element: (
              <FileEditRoute>
                <File />
              </FileEditRoute>
            ),
          },
          { path: ClientDashboardRoutes.CONTACT, element: null },
          { path: ClientDashboardRoutes.LOCATIONS, element: null },
          { path: ClientDashboardRoutes.REFERRALS, element: null },
          { path: '*', element: <Navigate to='profile' replace /> },
        ],
      },
      // Route for testing sentry errors
      {
        path: '/internal-error',
        element: <InternalError />,
      },
      { path: '/', element: <Dashboard /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];
