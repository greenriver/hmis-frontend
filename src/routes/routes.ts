const ReferralSubRoutes = {
  ReferralPath: 'referrals/:referralId',
  ReferralStepPath: 'referrals/:referralId/tasks/:stepId',
};

export const Routes = {
  CLIENT_SEARCH: '/',
  CLIENT_SEARCH_ADVANCED: '/advanced-search',
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
  USER_DASHBOARD: '/dashboard',
  MY_DASHBOARD: '/my-dashboard', // maintained for backwards compat
  REFERRALS: '/referrals',
} as const;

const adminDashboardRoutes = {
  CLIENT_MERGE_HISTORY: 'client-merge-history',
  PERFORM_CLIENT_MERGES: 'client-merge-history/candidates',
  AVAILABLE_UNITS: 'available-units',
  DEFAULT_CONTACTS: 'default-contacts',
  ELIGIBLE_CLIENTS: 'eligible-clients',
  REFERRALS: 'referrals',
  REFERRAL: ReferralSubRoutes.ReferralPath,
  REFERRAL_STEP: ReferralSubRoutes.ReferralStepPath,
  AC_DENIALS: 'referral-denials',
  AC_DENIAL_DETAILS: 'referral-denials/:referralPostingId',
  USERS: 'users',
  USER_CLIENT_ACCESS_HISTORY: 'users/:userId/clientAccessHistory',
  USER_ENROLLMENT_ACCESS_HISTORY: 'users/:userId/enrollmentAccessHistory',
  USER_EDIT_HISTORY: 'users/:userId/editHistory',
  USER_LOGIN_ACTIVITY: 'users/:userId/loginActivity',
  CONFIGURE_SERVICES: 'services',
  CONFIGURE_SERVICE_TYPE: 'services/:serviceTypeId',
  FORMS: 'forms',
  VIEW_FORM: 'forms/:identifier',
  EDIT_FORM: 'forms/:identifier/:formId/edit',
  JSON_EDIT_FORM: 'forms/:identifier/:formId/jsonEdit',
  PREVIEW_FORM: 'forms/:identifier/:formId/preview',
  PREVIEW_FORM_DRAFT: 'forms/:identifier/:formId/preview-draft',
  PROJECT_CONFIG: 'project-configs',
  CE_RULES_ROOT: 'rules',
  CE_RULES: 'rules/global',
  CE_RULE_GLOBAL_NEW: 'rules/global/new',
  CE_RULE_ORGANIZATIONS: 'rules/organizations',
  CE_RULE_ORGANIZATION: 'rules/organizations/:organizationId',
  CE_RULE_ORGANIZATION_NEW: 'rules/organizations/:organizationId/new',
  CE_RULE_PROJECTS: 'rules/projects',
  CE_RULE_PROJECT: 'rules/projects/:projectId',
  CE_RULE_PROJECT_NEW: 'rules/projects/:projectId/new',
  CE_RULE_UNIT_GROUPS: 'rules/unit-groups',
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
  PRINT_ALL_CASE_NOTES: 'case-notes/print',
  SCAN_CARDS: 'scan-cards',
  MERGE_HISTORY: 'merges',
  NEW_MERGE: 'merges/new',
  REFERRALS: 'referrals',
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
  LOCATION_MAP: 'locations',
};

// Routes within the project dashboard
const projectDashboardRoutes = {
  OVERVIEW: 'overview',
  EDIT_PROJECT: 'overview/edit',
  // Enrollment-related
  PROJECT_ENROLLMENTS: 'enrollments',
  PROJECT_ENROLLMENTS_CLIENTS: 'enrollments/clients',
  PROJECT_ENROLLMENTS_HOUSEHOLDS: 'enrollments/households',
  PROJECT_ASSESSMENTS: 'assessments',
  PROJECT_SERVICES: 'services',
  PROJECT_CURRENT_LIVING_SITUATIONS: 'current-living-situations',
  BULK_BED_NIGHTS: 'bed-nights',
  BULK_ASSIGN_SERVICE: 'bulk-service',
  BULK_BED_NIGHTS_NEW_HOUSEHOLD: 'bed-nights/new-household/:household?',
  BULK_SERVICE_NEW_HOUSEHOLD: 'bulk-service/new-household/:household?',
  ADD_SERVICES: 'add-services',
  ADD_HOUSEHOLD: 'add-household/:household?',
  REFERRALS: 'referrals',
  REFERRAL_POSTING: 'referrals/:referralPostingId', // TODO(#8142) remove - still used to update status for existing legacy referrals.
  ESG_FUNDING_REPORT: 'referrals/:referralPostingId/esg-funding-report', // TODO(#8142) remove route

  // Project setup
  FUNDERS: 'funder',
  NEW_FUNDER: 'funder/new',
  EDIT_FUNDER: 'funder/:funderId/edit',
  COCS: 'coc',
  NEW_COC: 'coc/new',
  EDIT_COC: 'coc/:cocId/edit',
  INVENTORY: 'inventory',
  NEW_INVENTORY: 'inventory/new',
  EDIT_INVENTORY: 'inventory/:inventoryId/edit',
  HMIS_PARTICIPATION: 'hmis-participation',
  CE_PARTICIPATION: 'ce-participation',
  EXTERNAL_FORM_SUBMISSIONS: 'external-form-submissions',

  // Unit Management
  UNITS: 'units',
  UNIT_GROUP: 'unitGroup/:unitGroupId',
  UNIT: 'unit/:unitId', // TODO: nest this under Unit Group to get full breadcrumbs

  // CE
  CE: 'ce', // referrals page, also rendered under /referrals for backwards compatibility
  CE_UNIT: 'ce/unit/:unitId', // render same Unit page, but within CE tab
  REFERRAL: 'ce/' + ReferralSubRoutes.ReferralPath,
  REFERRAL_STEP: 'ce/' + ReferralSubRoutes.ReferralStepPath,
  SEND_REFERRAL: 'ce/send-referral',
};

const referralRoutes = {
  AVAILABLE_UNITS: 'available-units',
  ELIGIBLE_CLIENTS: 'eligible-clients',
  REFERRAL: ':referralId',
  REFERRAL_STEP: ':referralId/tasks/:stepId',
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

type ReferralSubRoutesType = keyof typeof referralRoutes;
let key5: ReferralSubRoutesType;
for (key5 in referralRoutes) {
  referralRoutes[key5] = `${Routes.REFERRALS}/${referralRoutes[key5]}`;
}

export const ClientDashboardRoutes: { [k in ClientSubRoutesType]: string } =
  clientDashboardRoutes;

export const EnrollmentDashboardRoutes: {
  [k in EnrollmentSubRoutesType]: string;
} = enrollmentDashboardRoutes;

export const ProjectDashboardRoutes: {
  [k in ProjectSubRoutesType]: string;
} = projectDashboardRoutes;

export const ReferralRoutes: {
  [k in ReferralSubRoutesType]: string;
} = referralRoutes;

export const AdminDashboardRoutes: {
  [k in AdminSubRoutesType]: string;
} = adminDashboardRoutes;

// Routes that live "under" one of the dashboards, but they need to take up the full screen, so they shouldn't get the default padding applied.
export const NO_PADDING_ROUTES: string[] = [
  ProjectDashboardRoutes.REFERRAL,
  ProjectDashboardRoutes.REFERRAL_STEP,
  AdminDashboardRoutes.EDIT_FORM,
];

// Auto-hide left desktop nav for some routes
export const HIDE_NAV_ROUTES: string[] = [
  // Disabling this for now. Add it back if we can make it so the nav re-appears when you leave the page.
  // ProjectDashboardRoutes.REFERRAL,
  // ProjectDashboardRoutes.REFERRAL_STEPS,
  // ProjectDashboardRoutes.REFERRAL_STEP,
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
  ClientDashboardRoutes.PRINT_ALL_CASE_NOTES,
];

export const allRoutes = [
  Routes,
  ReferralRoutes,
  ClientDashboardRoutes,
  EnrollmentDashboardRoutes,
  ProjectDashboardRoutes,
  AdminDashboardRoutes,
]
  .flatMap((obj) => Object.values(obj))
  .map((s) => ({ path: s }));
