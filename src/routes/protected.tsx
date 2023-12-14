import { ReactNode, Suspense } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import {
  AdminDashboardRoutes,
  ClientDashboardRoutes,
  EnrollmentDashboardRoutes,
  ProjectDashboardRoutes,
  Routes,
} from './routes';

import ClientRoute from '@/components/accessWrappers/ClientRoute';
import EnrollmentProjectRoute from '@/components/accessWrappers/EnrollmentProjectRoute';
import EnrollmentRoute from '@/components/accessWrappers/EnrollmentRoute';
import FileEditRoute from '@/components/accessWrappers/FileEditRoute';
import ProjectEditRoute from '@/components/accessWrappers/ProjectEditRoute';
import ClientFiles from '@/components/clientDashboard/ClientFiles';
import EditClient from '@/components/clientDashboard/EditClient';
import AssessmentPage from '@/components/clientDashboard/enrollments/AssessmentPage';
import ClientAssessments from '@/components/clientDashboard/enrollments/ClientAssessments';
import ClientEnrollments from '@/components/clientDashboard/enrollments/ClientEnrollments';
import Profile from '@/components/clientDashboard/Profile';
import Loading from '@/components/elements/Loading';
import PathHandler from '@/components/elements/PathHandler';
import MainLayout from '@/components/layout/MainLayout';
import AllProjects from '@/components/pages/AllProjects';
import ClientDashboard from '@/components/pages/ClientDashboard';
import CreateClient from '@/components/pages/CreateClient';
import CreateOrganization from '@/components/pages/CreateOrganization';
import CreateProject from '@/components/pages/CreateProject';
import EditOrganization from '@/components/pages/EditOrganization';
import EnrollmentDashboard from '@/components/pages/EnrollmentDashboard';
import File from '@/components/pages/File';
import NotFound from '@/components/pages/NotFound';
import Organization from '@/components/pages/Organization';
import Dashboard from '@/components/pages/UserDashboard';
import AdminDashboard, {
  AdminLandingPage,
} from '@/modules/admin/components/AdminDashboard';

import ConfigureAutoExitPage from '@/modules/admin/components/autoExit/ConfigureAutoExitPage';
import AdminReferralDenials from '@/modules/admin/components/denials/AdminReferralDenials';
import AdminReferralPosting from '@/modules/admin/components/denials/AdminReferralPosting';
import FormRulesPage from '@/modules/admin/components/formRules/FormRulesPage';
import ConfigureServicesPage from '@/modules/admin/components/services/ConfigureServicesPage';
import ServiceCategoryDetail from '@/modules/admin/components/services/ServiceCategoryDetail';
import AdminUsers from '@/modules/admin/components/users/AdminUsers';
import UserAuditPage from '@/modules/admin/components/users/UserAuditPage';
import ClientAuditHistory from '@/modules/audit/components/ClientAuditHistory';
import EnrollmentAuditHistory from '@/modules/audit/components/EnrollmentAuditHistory';
import ProjectBedNights from '@/modules/bedNights/components/ProjectBedNights';
import AdminClientMerge from '@/modules/clientMerge/components/admin/AdminClientMerge';
import GlobalClientMergeHistory from '@/modules/clientMerge/components/admin/GlobalClientMergeHistory';
import ClientMergeHistory from '@/modules/clientMerge/components/client/ClientMergeHistory';
import NewClientMerge from '@/modules/clientMerge/components/client/NewClientMerge';
import EnrollmentAssessmentsPage from '@/modules/enrollment/components/dashboardPages/EnrollmentAssessmentsPage';
import EnrollmentCeAssessmentsPage from '@/modules/enrollment/components/dashboardPages/EnrollmentCeAssessmentsPage';
import EnrollmentCurrentLivingSituationsPage from '@/modules/enrollment/components/dashboardPages/EnrollmentCurrentLivingSituationsPage';
import EnrollmentCustomCaseNotesPage from '@/modules/enrollment/components/dashboardPages/EnrollmentCustomCaseNotesPage';
import EnrollmentEsgFundingReport from '@/modules/enrollment/components/dashboardPages/EnrollmentEsgFundingReport';
import EnrollmentEventsPage from '@/modules/enrollment/components/dashboardPages/EnrollmentEventsPage';
import EnrollmentOverview from '@/modules/enrollment/components/dashboardPages/EnrollmentOverview';
import EnrollmentServicesPage from '@/modules/enrollment/components/dashboardPages/EnrollmentServicesPage';
import HouseholdPage from '@/modules/enrollment/components/dashboardPages/HouseholdPage';
import SentryErrorBoundary from '@/modules/errors/components/SentryErrorBoundary';
import CreateHouseholdPage from '@/modules/household/components/CreateHouseholdPage';
import EditHouseholdPage from '@/modules/household/components/EditHouseholdPage';
import { RootPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import CeParticipations from '@/modules/projects/components/CeParticipations';
import Cocs from '@/modules/projects/components/Cocs';
import EditProject from '@/modules/projects/components/EditProject';
import Funder from '@/modules/projects/components/Funder';
import Funders from '@/modules/projects/components/Funders';
import HmisParticipations from '@/modules/projects/components/HmisParticipations';
import Inventories from '@/modules/projects/components/Inventories';
import Inventory from '@/modules/projects/components/Inventory';
import NewOutgoingReferral from '@/modules/projects/components/NewOutgoingReferral';
import NewReferralRequest from '@/modules/projects/components/NewReferralRequest';
import ProjectCoc from '@/modules/projects/components/ProjectCoc';
import ProjectDashboard from '@/modules/projects/components/ProjectDashboard';
import ProjectEnrollments from '@/modules/projects/components/ProjectEnrollments';
import ProjectEsgFundingReport from '@/modules/projects/components/ProjectEsgFundingReport';
import Project from '@/modules/projects/components/ProjectOverview';
import ProjectReferralPosting from '@/modules/projects/components/ProjectReferralPosting';
import ProjectReferrals from '@/modules/projects/components/ProjectReferrals';
import ProjectServices from '@/modules/projects/components/ProjectServices';
import ClientServices from '@/modules/services/components/ClientServices';
import SystemStatus from '@/modules/systemStatus/components/SystemStatus';
import Units from '@/modules/units/components/Units';

const App = () => {
  return (
    <MainLayout>
      <Suspense fallback={<Loading />}>
        <SentryErrorBoundary>
          <Outlet />
        </SentryErrorBoundary>
      </Suspense>
    </MainLayout>
  );
};

// const ParamsWrapper = <T extends { [x: string]: string } = any>({
//   children,
// }: {
//   children: (params: T) => JSX.Element;
// }): JSX.Element => {
//   const params = useSafeParams() as T;
//   return children(params);
// };

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
            path: ProjectDashboardRoutes.PROJECT_ENROLLMENTS,
            element: <ProjectEnrollments />,
          },
          {
            path: ProjectDashboardRoutes.PROJECT_SERVICES,
            element: <ProjectServices />,
          },
          {
            path: ProjectDashboardRoutes.PROJECT_BED_NIGHTS,
            element: <ProjectBedNights />,
          },
          {
            path: ProjectDashboardRoutes.PROJECT_BED_NIGHTS_NEW_ENROLLMENT,
            element: (
              <ProjectEditRoute
                permissions={['canEnrollClients']}
                redirectRoute={ProjectDashboardRoutes.PROJECT_ENROLLMENTS}
              >
                <CreateHouseholdPage />
              </ProjectEditRoute>
            ),
          },
          {
            path: ProjectDashboardRoutes.REFERRALS,
            element: (
              <ProjectEditRoute
                permissions={[
                  'canManageIncomingReferrals',
                  'canManageOutgoingReferrals',
                ]}
                redirectRoute={Routes.PROJECT}
              >
                <ProjectReferrals />
              </ProjectEditRoute>
            ),
          },
          {
            path: ProjectDashboardRoutes.REFERRAL_POSTING,
            element: (
              <ProjectEditRoute
                permissions={['canManageIncomingReferrals']}
                redirectRoute={Routes.PROJECT}
              >
                <ProjectReferralPosting />
              </ProjectEditRoute>
            ),
          },
          {
            path: ProjectDashboardRoutes.ESG_FUNDING_REPORT,
            element: (
              <ProjectEditRoute
                permissions={['canManageIncomingReferrals']}
                redirectRoute={Routes.PROJECT}
              >
                <ProjectEsgFundingReport />
              </ProjectEditRoute>
            ),
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
            path: ProjectDashboardRoutes.NEW_OUTGOING_REFERRAL,
            element: (
              <ProjectEditRoute
                permissions={['canManageOutgoingReferrals']}
                redirectRoute={Routes.PROJECT}
              >
                <NewOutgoingReferral />
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
            path: ProjectDashboardRoutes.HMIS_PARTICIPATION,
            element: <HmisParticipations />,
          },
          {
            path: ProjectDashboardRoutes.CE_PARTICIPATION,
            element: <CeParticipations />,
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
          // Disabled for now because it's not ready for MVP.
          // {
          //   path: ProjectDashboardRoutes.ADD_SERVICES,
          //   element: (
          //     <ProjectEditRoute
          //       permissions={['canEditEnrollments']}
          //       redirectRoute={ProjectDashboardRoutes.PROJECT_ENROLLMENTS}
          //     >
          //       <AddServices />
          //     </ProjectEditRoute>
          //   ),
          // },
          {
            path: ProjectDashboardRoutes.ADD_HOUSEHOLD,
            element: (
              <ProjectEditRoute
                permissions={['canEnrollClients']}
                redirectRoute={ProjectDashboardRoutes.PROJECT_ENROLLMENTS}
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
        path: Routes.ENROLLMENT_DASHBOARD,
        // No need for a permission filter on th Enrollment Dashboard.
        // If the enrollment is not found, the EnrollmentDashboard component will render NotFound.
        element: <EnrollmentDashboard />,
        children: [
          { path: '', element: <Navigate to='overview' replace /> },
          {
            path: EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW,
            // No perm needed because it only requires enrollment visibility
            element: <EnrollmentOverview />,
          },
          {
            path: EnrollmentDashboardRoutes.HOUSEHOLD,
            // No perm needed because it only requires enrollment visibility
            element: <HouseholdPage />,
          },
          {
            path: EnrollmentDashboardRoutes.EDIT_HOUSEHOLD,
            element: (
              <EnrollmentRoute
                permissions='canEditEnrollments'
                redirectRoute={EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW}
              >
                <EditHouseholdPage />
              </EnrollmentRoute>
            ),
          },
          {
            path: EnrollmentDashboardRoutes.ASSESSMENTS,
            // No perm needed because it only requires enrollment visibility
            element: <EnrollmentAssessmentsPage />,
          },
          {
            path: EnrollmentDashboardRoutes.ASSESSMENT,
            // No perm needed because it only requires enrollment visibility
            element: <AssessmentPage />,
          },
          {
            path: EnrollmentDashboardRoutes.SERVICES,
            // No perm needed because it only requires enrollment visibility
            element: <EnrollmentServicesPage />,
          },
          {
            path: EnrollmentDashboardRoutes.CURRENT_LIVING_SITUATIONS,
            // No perm needed because it only requires enrollment visibility
            element: <EnrollmentCurrentLivingSituationsPage />,
          },
          {
            path: EnrollmentDashboardRoutes.EVENTS,
            // No perm needed because it only requires enrollment visibility
            element: <EnrollmentEventsPage />,
          },
          {
            path: EnrollmentDashboardRoutes.AUDIT_HISTORY,
            element: (
              <EnrollmentRoute
                permissions='canAuditEnrollments'
                redirectRoute={EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW}
              >
                <EnrollmentAuditHistory />
              </EnrollmentRoute>
            ),
          },
          {
            path: EnrollmentDashboardRoutes.CE_ASSESSMENTS,
            // No perm needed because it only requires enrollment visibility
            element: <EnrollmentCeAssessmentsPage />,
          },
          {
            path: EnrollmentDashboardRoutes.CUSTOM_CASE_NOTES,
            // No perm needed because it only requires enrollment visibility
            element: <EnrollmentCustomCaseNotesPage />,
          },
          {
            path: EnrollmentDashboardRoutes.ESG_FUNDING_REPORT,
            element: (
              <EnrollmentProjectRoute
                permissions='canManageIncomingReferrals'
                redirectRoute={EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW}
              >
                <EnrollmentEsgFundingReport />
              </EnrollmentProjectRoute>
            ),
          },
          { path: '*', element: <Navigate to='overview' replace /> },
        ],
      },
      {
        path: Routes.CLIENT_DASHBOARD,
        // No need for a permission filter on th Client Dashboard.
        // If the client is not found, the ClientDashboard component will render NotFound.
        element: <ClientDashboard />,
        children: [
          { path: '', element: <Navigate to='profile' replace /> },
          {
            path: ClientDashboardRoutes.PROFILE,
            element: <Profile />,
          },
          {
            path: ClientDashboardRoutes.EDIT,
            element: (
              <ClientRoute
                permissions='canEditClient'
                redirectRoute={ClientDashboardRoutes.PROFILE}
              >
                <EditClient />
              </ClientRoute>
            ),
          },
          // disabled for now #185750557
          // {
          //   path: ClientDashboardRoutes.NEW_ENROLLMENT,
          //   element: (
          //     <ClientRoute
          //       permissions='canEditEnrollments'
          //       redirectRoute={ClientDashboardRoutes.CLIENT_ENROLLMENTS}
          //     >
          //       <NewEnrollment />
          //     </ClientRoute>
          //   ),
          // },
          {
            path: ClientDashboardRoutes.CLIENT_ENROLLMENTS,
            element: (
              <ClientRoute
                permissions='canViewEnrollmentDetails'
                redirectRoute={ClientDashboardRoutes.PROFILE}
              >
                <ClientEnrollments />
              </ClientRoute>
            ),
          },
          {
            path: ClientDashboardRoutes.ASSESSMENTS,
            element: (
              <ClientRoute
                permissions='canViewEnrollmentDetails'
                redirectRoute={ClientDashboardRoutes.PROFILE}
              >
                <ClientAssessments />
              </ClientRoute>
            ),
          },
          {
            path: ClientDashboardRoutes.SERVICES,
            element: (
              <ClientRoute
                permissions='canViewEnrollmentDetails'
                redirectRoute={ClientDashboardRoutes.PROFILE}
              >
                <ClientServices />
              </ClientRoute>
            ),
          },
          {
            path: ClientDashboardRoutes.AUDIT_HISTORY,
            element: (
              <ClientRoute
                permissions='canAuditClients'
                redirectRoute={ClientDashboardRoutes.PROFILE}
              >
                <ClientAuditHistory />
              </ClientRoute>
            ),
          },
          {
            path: ClientDashboardRoutes.MERGE_HISTORY,
            element: (
              <RootPermissionsFilter permissions='canMergeClients'>
                <ClientMergeHistory />
              </RootPermissionsFilter>
            ),
          },
          {
            path: ClientDashboardRoutes.NEW_MERGE,
            element: (
              <RootPermissionsFilter permissions='canMergeClients'>
                <NewClientMerge />
              </RootPermissionsFilter>
            ),
          },
          {
            path: ClientDashboardRoutes.FILES,
            element: (
              <ClientRoute
                permissions={[
                  'canViewAnyConfidentialClientFiles',
                  'canViewAnyNonconfidentialClientFiles',
                  'canManageOwnClientFiles',
                ]}
                redirectRoute={ClientDashboardRoutes.PROFILE}
              >
                <ClientFiles />
              </ClientRoute>
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
          { path: '*', element: <Navigate to='profile' replace /> },
        ],
      },
      {
        path: Routes.ADMIN,
        element: <AdminDashboard />,
        children: [
          {
            path: '',
            element: <AdminLandingPage />,
          },
          {
            path: AdminDashboardRoutes.CLIENT_MERGE_HISTORY,
            element: (
              <RootPermissionsFilter permissions='canMergeClients'>
                <GlobalClientMergeHistory />
              </RootPermissionsFilter>
            ),
          },
          {
            path: AdminDashboardRoutes.PERFORM_CLIENT_MERGES,
            element: (
              <RootPermissionsFilter permissions='canMergeClients'>
                <AdminClientMerge />
              </RootPermissionsFilter>
            ),
          },
          {
            path: AdminDashboardRoutes.AC_DENIALS,
            element: (
              <RootPermissionsFilter permissions='canManageDeniedReferrals'>
                <AdminReferralDenials />
              </RootPermissionsFilter>
            ),
          },
          {
            path: AdminDashboardRoutes.AC_DENIAL_DETAILS,
            element: (
              <RootPermissionsFilter permissions='canManageDeniedReferrals'>
                <AdminReferralPosting />
              </RootPermissionsFilter>
            ),
          },
          {
            path: AdminDashboardRoutes.USERS,
            element: (
              <RootPermissionsFilter
                permissions={['canImpersonateUsers', 'canAuditUsers']}
                mode='any'
              >
                <AdminUsers />
              </RootPermissionsFilter>
            ),
          },
          {
            path: AdminDashboardRoutes.USER_AUDIT,
            element: (
              <RootPermissionsFilter permissions='canAuditUsers'>
                <UserAuditPage />
              </RootPermissionsFilter>
            ),
          },
          {
            path: AdminDashboardRoutes.CONFIGURE_FORM_RULES,
            element: (
              <RootPermissionsFilter permissions='canConfigureDataCollection'>
                <FormRulesPage />
              </RootPermissionsFilter>
            ),
          },
          {
            path: AdminDashboardRoutes.CONFIGURE_SERVICES,
            element: (
              <RootPermissionsFilter permissions='canConfigureDataCollection'>
                <ConfigureServicesPage />
              </RootPermissionsFilter>
            ),
          },
          {
            path: AdminDashboardRoutes.CONFIGURE_SERVICE_CATEGORY,
            element: (
              <RootPermissionsFilter permissions='canConfigureDataCollection'>
                <ServiceCategoryDetail />
              </RootPermissionsFilter>
            ),
          },
          {
            path: AdminDashboardRoutes.CONFIGURE_AUTO_EXIT,
            element: (
              <RootPermissionsFilter permissions='canConfigureDataCollection'>
                <ConfigureAutoExitPage />
              </RootPermissionsFilter>
            ),
          },
        ],
      },
      { path: '/', element: <Dashboard /> },
      {
        path: '*',
        element: (
          <PathHandler>
            <NotFound />
          </PathHandler>
        ),
      },
    ],
  },
  {
    path: '/system_status/:detailType',
    element: <SystemStatus />,
  },
];
