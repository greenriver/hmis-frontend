import { ReactNode, Suspense } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import {
  ClientDashboardRoutes,
  ProjectDashboardRoutes,
  Routes,
} from './routes';

import ClientRoute from '@/components/accessWrappers/ClientRoute';
import EnrollmentsRoute from '@/components/accessWrappers/EnrollmentRoute';
import FileEditRoute from '@/components/accessWrappers/FileEditRoute';
import ProjectEditRoute from '@/components/accessWrappers/ProjectEditRoute';
import AllFiles from '@/components/clientDashboard/AllFiles';
import AuditHistory from '@/components/clientDashboard/AuditHistory';
import EditClient from '@/components/clientDashboard/EditClient';
import AllAssessments from '@/components/clientDashboard/enrollments/AllAssessments';
import AllEnrollments from '@/components/clientDashboard/enrollments/AllEnrollments';
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
import ClientDashboard from '@/components/pages/ClientDashboard';
import CreateClient from '@/components/pages/CreateClient';
import CreateOrganization from '@/components/pages/CreateOrganization';
import CreateProject from '@/components/pages/CreateProject';
import EditOrganization from '@/components/pages/EditOrganization';
import File from '@/components/pages/File';
import NotFound from '@/components/pages/NotFound';
import Organization from '@/components/pages/Organization';
import Dashboard from '@/components/pages/UserDashboard';
import useSafeParams from '@/hooks/useSafeParams';
import AdminDashboard from '@/modules/admin/components/AdminDashboard';
import AdminReferralDenials from '@/modules/admin/components/AdminReferralDenials';
import AdminReferralPosting from '@/modules/admin/components/AdminReferralPosting';
import SentryErrorBoundary from '@/modules/errors/components/SentryErrorBoundary';
import CreateHouseholdPage from '@/modules/household/components/CreateHouseholdPage';
import EditHouseholdPage from '@/modules/household/components/EditHouseholdPage';
import {
  ClientPermissionsFilter,
  RootPermissionsFilter,
} from '@/modules/permissions/PermissionsFilters';
import AddServices from '@/modules/projects/components/BulkAddServices';
import Cocs from '@/modules/projects/components/Cocs';
import EditProject from '@/modules/projects/components/EditProject';
import EsgFundingReport from '@/modules/projects/components/EsgFundingReport';
import Funder from '@/modules/projects/components/Funder';
import Funders from '@/modules/projects/components/Funders';
import Inventories from '@/modules/projects/components/Inventories';
import Inventory from '@/modules/projects/components/Inventory';
import NewReferralRequest from '@/modules/projects/components/NewReferralRequest';
import ProjectCoc from '@/modules/projects/components/ProjectCoc';
import ProjectDashboard from '@/modules/projects/components/ProjectDashboard';
import ProjectEnrollments from '@/modules/projects/components/ProjectEnrollments';
import Project from '@/modules/projects/components/ProjectOverview';
import ProjectReferralPosting from '@/modules/projects/components/ProjectReferralPosting';
import ProjectReferrals from '@/modules/projects/components/ProjectReferrals';
import ClientServices from '@/modules/services/components/ClientServices';
import Units from '@/modules/units/components/Units';
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

interface RouteNode {
  path: string;
  element: ReactNode;
  children?: RouteNode[];
}
export const protectedRoutes: RouteNode[] = [
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
            path: ProjectDashboardRoutes.REFERRAL_POSTING,
            element: <ProjectReferralPosting />,
          },
          {
            path: ProjectDashboardRoutes.ESG_FUNDING_REPORT,
            element: <EsgFundingReport />,
          },
          {
            path: ProjectDashboardRoutes.NEW_REFERRAL_REQUEST,
            element: (
              <ProjectEditRoute
                permissions={['canManageIncomingReferrals']}
                redirectRoute={Routes.PROJECT}
              >
                <NewReferralRequest />
              </ProjectEditRoute>
            ),
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
            path: ProjectDashboardRoutes.UNITS,
            element: <Units />,
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
                redirectRoute={ProjectDashboardRoutes.ENROLLMENTS}
              >
                <AddServices />
              </ProjectEditRoute>
            ),
          },
          {
            path: ProjectDashboardRoutes.ADD_HOUSEHOLD,
            element: (
              <ProjectEditRoute
                permissions={['canEnrollClients']}
                redirectRoute={ProjectDashboardRoutes.ENROLLMENTS}
              >
                <CreateHouseholdPage />
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
        element: <EditOrganization />,
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
          <RootPermissionsFilter permissions='canEditClients'>
            <CreateClient />
          </RootPermissionsFilter>
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
              <ParamsWrapper<{ clientId: string }>>
                {({ clientId }) => (
                  <ClientPermissionsFilter
                    id={clientId}
                    permissions='canEditClient'
                    otherwise={
                      <Navigate
                        to={generateSafePath(ClientDashboardRoutes.PROFILE, {
                          clientId,
                        })}
                        replace
                      />
                    }
                  >
                    <EditClient />
                  </ClientPermissionsFilter>
                )}
              </ParamsWrapper>
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
                <EditHouseholdPage />
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
          {
            path: ClientDashboardRoutes.SERVICES,
            element: (
              <EnrollmentsRoute
                view
                redirectRoute={ClientDashboardRoutes.PROFILE}
              >
                <ClientServices />
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
      {
        path: Routes.ADMIN,
        element: <AdminDashboard />,
        children: [
          {
            path: '',
            element: <Navigate to={Routes.ADMIN_REFERRAL_DENIALS} replace />,
          },
          {
            path: Routes.ADMIN_REFERRAL_DENIALS,
            element: <AdminReferralDenials />,
          },
          {
            path: Routes.ADMIN_REFERRAL_DENIAL,
            element: <AdminReferralPosting />,
          },
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
