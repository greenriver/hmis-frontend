export const Routes = {
  CLIENT_SEARCH: '/',
  CREATE_CLIENT: '/client/new',
  CLIENT_DASHBOARD: '/client/:clientId',
  ENROLLMENT_DASHBOARD: '/client/:clientId/enrollments/:enrollmentId',
  ALL_PROJECTS: '/projects',
  ADMIN: '/admin',
  PROJECT: '/projects/:projectId',
  ORGANIZATION: '/organizations/:organizationId',
  EDIT_ORGANIZATION: '/organizations/:organizationId/edit',
  CREATE_PROJECT: '/organizations/:organizationId/new-project',
  CREATE_ORGANIZATION: '/projects/new-organization',
} as const;

const adminDashboardRoutes = {
  CLIENT_MERGE_HISTORY: 'client-merge-history',
  PERFORM_CLIENT_MERGES: 'client-merge-history/candidates',
  AC_DENIALS: 'referral-denials',
  AC_DENIAL_DETAILS: 'referral-denials/:referralPostingId',
};

// Routes within the client dashboard
const clientDashboardRoutes = {
  PROFILE: 'profile',
  EDIT: 'profile/edit',
  NEW_ENROLLMENT: 'enrollments/new',
  SERVICES: 'services',
  CLIENT_ENROLLMENTS: 'enrollments',
  AUDIT_HISTORY: 'history',
  ASSESSMENTS: 'assessments',
  FILES: 'files',
  NEW_FILE: 'files/new',
  EDIT_FILE: 'files/:fileId/edit',
  MERGE_HISTORY: 'merges',
  NEW_MERGE: 'merges/new',
};

// Routes within the enrollment dashboard
const enrollmentDashboardRoutes = {
  ENROLLMENT_OVERVIEW: 'overview',
  HOUSEHOLD: 'household',
  EDIT_HOUSEHOLD: 'household/edit',
  ASSESSMENTS: 'assessments',
  SERVICES: 'services',
  CURRENT_LIVING_SITUATIONS: 'current-living-situations',
  EVENTS: 'events',
  CE_ASSESSMENTS: 'ce-assessments',
  CUSTOM_CASE_NOTES: 'case-notes',
  ASSESSMENT: 'assessments/:formRole/:assessmentId?',
  ESG_FUNDING_REPORT: 'esg-funding-report',
};

// Routes within the project dashboard
const projectDashboardRoutes = {
  OVERVIEW: 'overview',
  EDIT_PROJECT: 'overview/edit',
  // Enrollment-related
  PROJECT_ENROLLMENTS: 'enrollments',
  PROJECT_SERVICES: 'services',
  PROJECT_BED_NIGHTS: 'bed-nights',
  PROJECT_BED_NIGHTS_NEW_ENROLLMENT: 'bed-nights/enroll',
  ADD_SERVICES: 'add-services',
  ADD_HOUSEHOLD: 'add-household',
  REFERRALS: 'referrals',
  NEW_REFERRAL_REQUEST: 'referrals/new-referral-request',
  NEW_REFERRAL: 'referrals/new-referral',
  NEW_OUTGOING_REFERRAL: 'referrals/new-outgoing-referral',
  REFERRAL_POSTING: 'referrals/:referralPostingId',
  ESG_FUNDING_REPORT: 'referrals/:referralPostingId/esg-funding-report',

  // Project setup
  FUNDERS: 'funder',
  NEW_FUNDER: 'funder/new',
  EDIT_FUNDER: 'funder/:funderId/edit',
  COCS: 'coc',
  NEW_COC: 'coc/new',
  EDIT_COC: 'coc/:cocId/edit',
  UNITS: 'units',
  INVENTORY: 'inventory',
  NEW_INVENTORY: 'inventory/new',
  EDIT_INVENTORY: 'inventory/:inventoryId/edit',
  HMIS_PARTICIPATION: 'hmis-participation',
  CE_PARTICIPATION: 'ce-participation',
};

// Set up full dashboard routes so we can use `generateSafePath`
type ClientSubRoutesType = keyof typeof clientDashboardRoutes;
let key: ClientSubRoutesType;
for (key in clientDashboardRoutes) {
  clientDashboardRoutes[
    key
  ] = `${Routes.CLIENT_DASHBOARD}/${clientDashboardRoutes[key]}`;
}
type EnrollmentSubRoutesType = keyof typeof enrollmentDashboardRoutes;
let key2: EnrollmentSubRoutesType;
for (key2 in enrollmentDashboardRoutes) {
  enrollmentDashboardRoutes[
    key2
  ] = `${Routes.ENROLLMENT_DASHBOARD}/${enrollmentDashboardRoutes[key2]}`;
}

type ProjectSubRoutesType = keyof typeof projectDashboardRoutes;
let key3: ProjectSubRoutesType;
for (key3 in projectDashboardRoutes) {
  projectDashboardRoutes[
    key3
  ] = `${Routes.PROJECT}/${projectDashboardRoutes[key3]}`;
}

type AdminSubRoutesType = keyof typeof adminDashboardRoutes;
let key4: AdminSubRoutesType;
for (key4 in adminDashboardRoutes) {
  adminDashboardRoutes[key4] = `${Routes.ADMIN}/${adminDashboardRoutes[key4]}`;
}

export const ClientDashboardRoutes: { [k in ClientSubRoutesType]: string } =
  clientDashboardRoutes;

export const EnrollmentDashboardRoutes: {
  [k in EnrollmentSubRoutesType]: string;
} = enrollmentDashboardRoutes;

export const ProjectDashboardRoutes: {
  [k in ProjectSubRoutesType]: string;
} = projectDashboardRoutes;

export const AdminDashboardRoutes: {
  [k in AdminSubRoutesType]: string;
} = adminDashboardRoutes;

export const HIDE_NAV_ROUTES = [EnrollmentDashboardRoutes.ASSESSMENT];

export const FOCUS_MODE_ROUTES = [
  // {
  //   route: ClientDashboardRoutes.HOUSEHOLD_EXIT,
  //   previous: EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW,
  // },
  // {
  //   route: ClientDashboardRoutes.HOUSEHOLD_INTAKE,
  //   previous: EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW,
  // },
];

export const PRINTABLE_ROUTES = [
  EnrollmentDashboardRoutes.ASSESSMENT,
  EnrollmentDashboardRoutes.ESG_FUNDING_REPORT,
  ProjectDashboardRoutes.ESG_FUNDING_REPORT,
];
