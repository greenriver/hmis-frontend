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
  MY_DASHBOARD: '/my-dashboard',
} as const;

const adminDashboardRoutes = {
  CLIENT_MERGE_HISTORY: 'client-merge-history',
  PERFORM_CLIENT_MERGES: 'client-merge-history/candidates',
  AC_DENIALS: 'referral-denials',
  AC_DENIAL_DETAILS: 'referral-denials/:referralPostingId',
  USERS: 'users',
  USER_CLIENT_ACCESS_HISTORY: 'users/:userId/clientAccessHistory',
  USER_ENROLLMENT_ACCESS_HISTORY: 'users/:userId/enrollmentAccessHistory',
  USER_EDIT_HISTORY: 'users/:userId/editHistory',
  CONFIGURE_SERVICES: 'services',
  CONFIGURE_SERVICE_TYPE: 'services/:serviceTypeId',
  FORMS: 'forms',
  VIEW_FORM: 'forms/:identifier',
  EDIT_FORM: 'forms/:identifier/:formId/edit',
  JSON_EDIT_FORM: 'forms/:identifier/:formId/jsonEdit',
  PREVIEW_FORM: 'forms/:identifier/:formId/preview',
  PREVIEW_FORM_DRAFT: 'forms/:identifier/:formId/preview-draft',
  PROJECT_CONFIG: 'project-configs',
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
  CASE_NOTES: 'case-notes',
  SCAN_CARDS: 'scan-cards',
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
  INTAKE: 'intake', // Go to intake (render household view, or navigate to View/Create individual assessment appropriate)
  EXIT: 'exit', // Go to exit (render household view, or navigate to View/Create individual assessment as appropriate)
  VIEW_ASSESSMENT: 'assessments/:assessmentId', // View/Edit individual assessment
  NEW_ASSESSMENT: 'assessments/new/:formDefinitionId', // Create new individual assessment
  ESG_FUNDING_REPORT: 'esg-funding-report',
  AUDIT_HISTORY: 'history',
};

// Routes within the project dashboard
const projectDashboardRoutes = {
  OVERVIEW: 'overview',
  EDIT_PROJECT: 'overview/edit',
  // Enrollment-related
  PROJECT_ENROLLMENTS: 'enrollments',
  PROJECT_ASSESSMENTS: 'assessments',
  PROJECT_SERVICES: 'services',
  PROJECT_CURRENT_LIVING_SITUATIONS: 'current-living-situations',
  BULK_BED_NIGHTS: 'bed-nights',
  BULK_ASSIGN_SERVICE: 'bulk-service',
  BULK_BED_NIGHTS_NEW_HOUSEHOLD: 'bed-nights/new-household',
  BULK_SERVICE_NEW_HOUSEHOLD: 'bulk-service/new-household',
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
  EXTERNAL_FORM_SUBMISSIONS: 'external-form-submissions',
};

// Set up full dashboard routes so we can use `generateSafePath`
type ClientSubRoutesType = keyof typeof clientDashboardRoutes;
let key: ClientSubRoutesType;
for (key in clientDashboardRoutes) {
  clientDashboardRoutes[key] =
    `${Routes.CLIENT_DASHBOARD}/${clientDashboardRoutes[key]}`;
}
type EnrollmentSubRoutesType = keyof typeof enrollmentDashboardRoutes;
let key2: EnrollmentSubRoutesType;
for (key2 in enrollmentDashboardRoutes) {
  enrollmentDashboardRoutes[key2] =
    `${Routes.ENROLLMENT_DASHBOARD}/${enrollmentDashboardRoutes[key2]}`;
}

type ProjectSubRoutesType = keyof typeof projectDashboardRoutes;
let key3: ProjectSubRoutesType;
for (key3 in projectDashboardRoutes) {
  projectDashboardRoutes[key3] =
    `${Routes.PROJECT}/${projectDashboardRoutes[key3]}`;
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

// Auto-hide left desktop nav for some routes
export const HIDE_NAV_ROUTES: string[] = [
  // EnrollmentDashboardRoutes.NEW_ASSESSMENT
  // AdminDashboardRoutes.EDIT_FORM,
];

export const FOCUS_MODE_ROUTES = [
  {
    route: EnrollmentDashboardRoutes.EXIT,
    defaultReturnPath: EnrollmentDashboardRoutes.ASSESSMENTS,
  },
  {
    route: EnrollmentDashboardRoutes.INTAKE,
    defaultReturnPath: EnrollmentDashboardRoutes.ASSESSMENTS,
  },
  {
    route: EnrollmentDashboardRoutes.NEW_ASSESSMENT,
    defaultReturnPath: EnrollmentDashboardRoutes.ASSESSMENTS,
  },
  {
    route: EnrollmentDashboardRoutes.VIEW_ASSESSMENT,
    defaultReturnPath: EnrollmentDashboardRoutes.ASSESSMENTS,
  },
];

export const PRINTABLE_ROUTES = [
  EnrollmentDashboardRoutes.VIEW_ASSESSMENT,
  EnrollmentDashboardRoutes.ESG_FUNDING_REPORT,
  ProjectDashboardRoutes.ESG_FUNDING_REPORT,
];

export const allRoutes = [
  Routes,
  ClientDashboardRoutes,
  EnrollmentDashboardRoutes,
  ProjectDashboardRoutes,
  AdminDashboardRoutes,
]
  .flatMap((obj) => Object.values(obj))
  .map((s) => ({ path: s }));
