export const Routes = {
  CLIENT_SEARCH: '/',
  CREATE_CLIENT: '/client/new',
  CLIENT_DASHBOARD: '/client/:clientId',
  ENROLLMENT_DASHBOARD: '/client/:clientId/enrollments/:enrollmentId',
  ALL_PROJECTS: '/projects',
  ADMIN: '/admin',
  ADMIN_REFERRAL_DENIALS: '/admin/referral-denials',
  ADMIN_REFERRAL_DENIAL: '/admin/referral-denials/:referralPostingId',
  PROJECT: '/projects/:projectId',
  ORGANIZATION: '/organizations/:organizationId',
  EDIT_ORGANIZATION: '/organizations/:organizationId/edit',
  CREATE_PROJECT: '/organizations/:organizationId/new-project',
  CREATE_ORGANIZATION: '/projects/new-organization',
} as const;

// Routes within the client dashboard
const clientDashboardRoutes = {
  PROFILE: 'profile',
  EDIT: 'profile/edit',
  NEW_ENROLLMENT: 'enrollments/new',
  SERVICES: 'services',
  CLIENT_ENROLLMENTS: 'enrollments',
  AUDIT_HISTORY: 'history',
  ASSESSMENTS: 'assessments',
  NOTES: 'notes',
  FILES: 'files',
  NEW_FILE: 'files/new',
  EDIT_FILE: 'files/:fileId/edit',
  CONTACT: 'contact',
  LOCATIONS: 'locations',
  REFERRALS: 'referrals',
};

const enrollmentDashboardRoutes = {
  ENROLLMENT_OVERVIEW: 'overview',
  HOUSEHOLD: 'household',
  EDIT_HOUSEHOLD: 'household/edit',
  ASSESSMENTS: 'assessments',
  SERVICES: 'services',
  CURRENT_LIVING_SITUATIONS: 'current-living-situations',
  EVENTS: 'events',
  CE_ASSESSMENTS: 'ce-assessments',
  ASSESSMENT: 'assessments/:formRole/:assessmentId?',
  ESG_FUNDING_REPORT: 'esg-funding-report',
};

// Routes within the project dashboard
const projectDashboardRoutes = {
  OVERVIEW: 'overview',
  EDIT_PROJECT: 'overview/edit',
  // Enrollment-related
  PROJECT_ENROLLMENTS: 'enrollments',
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

export const ClientDashboardRoutes: { [k in ClientSubRoutesType]: string } =
  clientDashboardRoutes;

export const EnrollmentDashboardRoutes: {
  [k in EnrollmentSubRoutesType]: string;
} = enrollmentDashboardRoutes;

export const ProjectDashboardRoutes: {
  [k in ProjectSubRoutesType]: string;
} = projectDashboardRoutes;

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
