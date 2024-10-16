import React, { ReactNode, Suspense } from 'react';
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
import ProjectRoute from '@/components/accessWrappers/ProjectRoute';
import ClientFiles from '@/components/clientDashboard/ClientFiles';
import EditClient from '@/components/clientDashboard/EditClient';
import ClientAssessments from '@/components/clientDashboard/enrollments/ClientAssessments';
import ClientEnrollments from '@/components/clientDashboard/enrollments/ClientEnrollments';
import Profile from '@/components/clientDashboard/Profile';
import Loading from '@/components/elements/Loading';
import PathHandler from '@/components/elements/PathHandler';
import MainLayout from '@/components/layout/MainLayout';
import {
  MobileMenuContext,
  useMobileMenuContext,
} from '@/components/layout/nav/useMobileMenuContext';
import AllProjects from '@/components/pages/AllProjects';
import ClientDashboard from '@/components/pages/ClientDashboard';
import ClientSearchPage from '@/components/pages/ClientSearchPage';
import CreateClient from '@/components/pages/CreateClient';
import CreateOrganization from '@/components/pages/CreateOrganization';
import CreateProject from '@/components/pages/CreateProject';
import EditOrganization from '@/components/pages/EditOrganization';
import EnrollmentDashboard from '@/components/pages/EnrollmentDashboard';
import File from '@/components/pages/File';
import NotFound from '@/components/pages/NotFound';
import Organization from '@/components/pages/Organization';
import UserDashboard from '@/components/pages/UserDashboard';
import AdminDashboard, {
  AdminLandingPage,
} from '@/modules/admin/components/AdminDashboard';

import AdminReferralDenials from '@/modules/admin/components/denials/AdminReferralDenials';
import AdminReferralPosting from '@/modules/admin/components/denials/AdminReferralPosting';
import FormDefinitionDetailPage from '@/modules/admin/components/forms/FormDefinitionDetailPage';
import FormDefinitionsPage from '@/modules/admin/components/forms/FormDefinitionsPage';
import FormPreview from '@/modules/admin/components/forms/FormPreview';
import JsonFormEditorPage from '@/modules/admin/components/forms/JsonFormEditorPage';
import ProjectConfigPage from '@/modules/admin/components/projectConfig/ProjectConfigPage';
import ConfigureServicesPage from '@/modules/admin/components/services/ConfigureServicesPage';
import ServiceTypeDetailPage from '@/modules/admin/components/services/ServiceTypeDetailPage';
import AdminUsers from '@/modules/admin/components/users/AdminUsers';
import UserAuditPage from '@/modules/admin/components/users/UserAuditPage';
import ExitAssessmentPage from '@/modules/assessments/components/ExitAssessmentPage';
import IndividualAssessmentPage from '@/modules/assessments/components/IndividualAssessmentPage';
import IntakeAssessmentPage from '@/modules/assessments/components/IntakeAssessmentPage';
import NewIndividualAssessmentPage from '@/modules/assessments/components/NewIndividualAssessmentPage';
import ClientAuditHistory from '@/modules/audit/components/ClientAuditHistory';
import EnrollmentAuditHistory from '@/modules/audit/components/EnrollmentAuditHistory';
import ClientCaseNotes from '@/modules/caseNotes/ClientCaseNotes';
import EnrollmentCaseNotes from '@/modules/caseNotes/EnrollmentCaseNotes';
import AdminClientMerge from '@/modules/clientMerge/components/admin/AdminClientMerge';
import GlobalClientMergeHistory from '@/modules/clientMerge/components/admin/GlobalClientMergeHistory';
import ClientMergeHistory from '@/modules/clientMerge/components/client/ClientMergeHistory';
import NewClientMerge from '@/modules/clientMerge/components/client/NewClientMerge';
import EnrollmentAssessmentsPage from '@/modules/enrollment/components/dashboardPages/EnrollmentAssessmentsPage';
import EnrollmentCeAssessmentsPage from '@/modules/enrollment/components/dashboardPages/EnrollmentCeAssessmentsPage';
import EnrollmentCeEventsPage from '@/modules/enrollment/components/dashboardPages/EnrollmentCeEventsPage';
import EnrollmentCurrentLivingSituationsPage from '@/modules/enrollment/components/dashboardPages/EnrollmentCurrentLivingSituationsPage';
import EnrollmentEsgFundingReport from '@/modules/enrollment/components/dashboardPages/EnrollmentEsgFundingReport';
import EnrollmentOverview from '@/modules/enrollment/components/dashboardPages/EnrollmentOverview';
import EnrollmentServicesPage from '@/modules/enrollment/components/dashboardPages/EnrollmentServicesPage';
import HouseholdPage from '@/modules/enrollment/components/dashboardPages/HouseholdPage';
import SentryErrorBoundary from '@/modules/errors/components/SentryErrorBoundary';
import FormBuilderPage from '@/modules/formBuilder/components/FormBuilderPage';
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
import ProjectAssessments from '@/modules/projects/components/ProjectAssessments';
import ProjectCoc from '@/modules/projects/components/ProjectCoc';
import ProjectCurrentLivingSituations from '@/modules/projects/components/ProjectCurrentLivingSituations';
import ProjectDashboard from '@/modules/projects/components/ProjectDashboard';
import ProjectEnrollments from '@/modules/projects/components/ProjectEnrollments';
import ProjectEsgFundingReport from '@/modules/projects/components/ProjectEsgFundingReport';
import ProjectExternalFormSubmissions from '@/modules/projects/components/ProjectExternalFormSubmissions';
import Project from '@/modules/projects/components/ProjectOverview';
import ProjectReferralPosting from '@/modules/projects/components/ProjectReferralPosting';
import ProjectReferrals from '@/modules/projects/components/ProjectReferrals';
import ProjectServices from '@/modules/projects/components/ProjectServices';
import ClientScanCards from '@/modules/scanCards/components/ClientScanCards';
import BedNightsPage from '@/modules/services/components/bulk/BedNightsPage';
import BulkServicesPage from '@/modules/services/components/bulk/BulkServicesPage';
import ClientServices from '@/modules/services/components/ClientServices';
import SystemStatus from '@/modules/systemStatus/components/SystemStatus';
import Units from '@/modules/units/components/Units';

const App = () => {
  // Setup mobile menu context - open/closed state and handlers
  const mobileMenuContext = useMobileMenuContext();

  return (
    <MainLayout
      // Provide mobile menu context directly to the Main Layout for rendering the non-Dashboard nav.
      // Can't use `useMobileMenu` hook for the context provided by the Outlet, since this is outside the Outlet.
      mobileMenuContext={mobileMenuContext}
    >
      <Suspense fallback={<Loading />}>
        <SentryErrorBoundary>
          <Outlet
            // Provide mobile menu context to the children via Outlet so that Dashboard components
            // can use the same menu component but inject their own navigational elements
            context={mobileMenuContext satisfies MobileMenuContext}
          />
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
      { path: Routes.MY_DASHBOARD, element: <UserDashboard /> },
      {
        path: Routes.PROJECT,
        element: <ProjectDashboard />,
        children: [
          {
            path: '',
            element: (
              <ProjectRoute
                permissions={['canViewEnrollmentDetails']}
                redirectRoute={ProjectDashboardRoutes.OVERVIEW}
              >
                <Navigate to='enrollments' replace />
              </ProjectRoute>
            ),
          },
          {
            path: ProjectDashboardRoutes.OVERVIEW,
            element: <Project />,
          },
          {
            path: ProjectDashboardRoutes.PROJECT_ENROLLMENTS,
            element: <ProjectEnrollments />,
          },
          {
            path: ProjectDashboardRoutes.PROJECT_ASSESSMENTS,
            element: <ProjectAssessments />,
          },
          {
            path: ProjectDashboardRoutes.PROJECT_SERVICES,
            element: <ProjectServices />,
          },
          {
            path: ProjectDashboardRoutes.PROJECT_CURRENT_LIVING_SITUATIONS,
            element: <ProjectCurrentLivingSituations />,
          },
          {
            path: ProjectDashboardRoutes.BULK_BED_NIGHTS,
            element: (
              <ProjectEditRoute permissions={['canEditEnrollments']}>
                <BedNightsPage />
              </ProjectEditRoute>
            ),
          },
          {
            path: ProjectDashboardRoutes.BULK_ASSIGN_SERVICE,
            element: (
              <ProjectEditRoute permissions={['canEditEnrollments']}>
                <BulkServicesPage />
              </ProjectEditRoute>
            ),
          },
          {
            path: ProjectDashboardRoutes.BULK_BED_NIGHTS_NEW_HOUSEHOLD,
            element: (
              <ProjectEditRoute permissions={['canEnrollClients']}>
                <CreateHouseholdPage />
              </ProjectEditRoute>
            ),
          },
          {
            path: ProjectDashboardRoutes.BULK_SERVICE_NEW_HOUSEHOLD,
            element: (
              <ProjectEditRoute permissions={['canEnrollClients']}>
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
          {
            path: ProjectDashboardRoutes.EXTERNAL_FORM_SUBMISSIONS,
            element: (
              <ProjectEditRoute
                permissions={['canManageExternalFormSubmissions']}
              >
                <ProjectExternalFormSubmissions />
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
            path: EnrollmentDashboardRoutes.INTAKE,
            element: <IntakeAssessmentPage />,
          },
          {
            path: EnrollmentDashboardRoutes.EXIT,
            element: <ExitAssessmentPage />,
          },
          {
            // view/edit existing individual assessment
            path: EnrollmentDashboardRoutes.VIEW_ASSESSMENT,
            element: <IndividualAssessmentPage />,
          },
          {
            // create new individual assessment
            path: EnrollmentDashboardRoutes.NEW_ASSESSMENT,
            element: (
              <EnrollmentRoute
                permissions='canEditEnrollments'
                redirectRoute={EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW}
              >
                <NewIndividualAssessmentPage />
              </EnrollmentRoute>
            ),
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
            element: <EnrollmentCeEventsPage />,
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
            element: <EnrollmentCaseNotes />,
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
              // Prevent UI-access to edit client if user lacks name access, to avoid situation where masked name ("Client X") is submitted. See follow-up #187358025
              // This is just a safeguard against a situation that should never happen, so we aren't adding checks to hide the button/link to this route everywhere it appears
              <ClientRoute
                permissions={['canEditClient', 'canViewClientName']}
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
            path: ClientDashboardRoutes.CASE_NOTES,
            element: (
              <ClientRoute
                permissions='canViewEnrollmentDetails'
                redirectRoute={ClientDashboardRoutes.PROFILE}
              >
                <ClientCaseNotes />
              </ClientRoute>
            ),
          },
          {
            path: ClientDashboardRoutes.SCAN_CARDS,
            element: (
              <ClientRoute
                permissions='canManageScanCards'
                redirectRoute={ClientDashboardRoutes.PROFILE}
              >
                <ClientScanCards />
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
                permissions='canViewAnyFiles'
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
            path: AdminDashboardRoutes.USER_CLIENT_ACCESS_HISTORY,
            element: (
              <RootPermissionsFilter permissions='canAuditUsers'>
                <UserAuditPage
                  userHistoryType='access'
                  accessEntityType='clients'
                />
              </RootPermissionsFilter>
            ),
          },
          {
            path: AdminDashboardRoutes.USER_ENROLLMENT_ACCESS_HISTORY,
            element: (
              <RootPermissionsFilter permissions='canAuditUsers'>
                <UserAuditPage
                  userHistoryType='access'
                  accessEntityType='enrollments'
                />
              </RootPermissionsFilter>
            ),
          },
          {
            path: AdminDashboardRoutes.USER_EDIT_HISTORY,
            element: (
              <RootPermissionsFilter permissions='canAuditUsers'>
                <UserAuditPage userHistoryType='edits' />
              </RootPermissionsFilter>
            ),
          },
          {
            path: AdminDashboardRoutes.FORMS,
            element: (
              <RootPermissionsFilter permissions='canConfigureDataCollection'>
                <FormDefinitionsPage />
              </RootPermissionsFilter>
            ),
          },
          {
            path: AdminDashboardRoutes.VIEW_FORM,
            element: (
              <RootPermissionsFilter permissions='canConfigureDataCollection'>
                <FormDefinitionDetailPage />
              </RootPermissionsFilter>
            ),
          },
          {
            path: AdminDashboardRoutes.EDIT_FORM,
            element: (
              <RootPermissionsFilter permissions='canManageForms'>
                <FormBuilderPage />
              </RootPermissionsFilter>
            ),
          },
          {
            path: AdminDashboardRoutes.JSON_EDIT_FORM,
            element: (
              <RootPermissionsFilter permissions='canAdministrateConfig'>
                <JsonFormEditorPage />
              </RootPermissionsFilter>
            ),
          },
          {
            path: AdminDashboardRoutes.PREVIEW_FORM,
            element: (
              <RootPermissionsFilter permissions='canConfigureDataCollection'>
                <FormPreview />
              </RootPermissionsFilter>
            ),
          },
          {
            path: AdminDashboardRoutes.PREVIEW_FORM_DRAFT,
            element: (
              <RootPermissionsFilter permissions='canConfigureDataCollection'>
                <FormPreview />
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
            path: AdminDashboardRoutes.CONFIGURE_SERVICE_TYPE,
            element: (
              <RootPermissionsFilter permissions='canConfigureDataCollection'>
                <ServiceTypeDetailPage />
              </RootPermissionsFilter>
            ),
          },
          {
            path: AdminDashboardRoutes.PROJECT_CONFIG,
            element: (
              <RootPermissionsFilter permissions='canConfigureDataCollection'>
                <ProjectConfigPage />
              </RootPermissionsFilter>
            ),
          },
        ],
      },
      { path: '/', element: <ClientSearchPage /> },
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
