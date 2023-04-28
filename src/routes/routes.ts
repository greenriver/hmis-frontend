export const Routes = {
  CLIENT_SEARCH: '/',
  CREATE_CLIENT: '/client/new',
  CLIENT_DASHBOARD: '/client/:clientId',
  ALL_PROJECTS: '/projects',
  PROJECT: '/projects/:projectId',
  // EDIT_PROJECT: '/projects/:projectId/edit',
  // NEW_INVENTORY: '/projects/:projectId/inventory/new',
  // EDIT_INVENTORY: '/projects/:projectId/inventory/:inventoryId/edit',
  // MANAGE_INVENTORY_BEDS: '/projects/:projectId/inventory/:inventoryId/beds',
  // NEW_FUNDER: '/projects/:projectId/funder/new',
  // EDIT_FUNDER: '/projects/:projectId/funder/:funderId/edit',
  // NEW_COC: '/projects/:projectId/coc/new',
  // EDIT_COC: '/projects/:projectId/coc/:cocId/edit',
  // ADD_SERVICES: '/projects/:projectId/add-services',
  ORGANIZATION: '/organizations/:organizationId',
  EDIT_ORGANIZATION: '/organizations/:organizationId/edit',
  CREATE_PROJECT: '/organizations/:organizationId/new-project',
  CREATE_ORGANIZATION: '/projects/new-organization',
} as const;

// Routes within the client dashboard
const clientClientDashboardRoutes = {
  PROFILE: 'profile',
  EDIT: 'profile/edit',
  NEW_ENROLLMENT: 'enrollments/new',
  VIEW_ENROLLMENT: 'enrollments/:enrollmentId',
  EDIT_HOUSEHOLD: 'enrollments/:enrollmentId/edit-household',
  HOUSEHOLD_EXIT: 'enrollments/:enrollmentId/household-exit',
  HOUSEHOLD_INTAKE: 'enrollments/:enrollmentId/household-intake',
  NEW_ASSESSMENT: 'enrollments/:enrollmentId/assessments/:formRole/new',
  VIEW_ASSESSMENT: 'enrollments/:enrollmentId/assessments/:assessmentId',
  NEW_SERVICE: 'enrollments/:enrollmentId/services/new',
  EDIT_SERVICE: 'enrollments/:enrollmentId/services/:serviceId/edit',
  ALL_ENROLLMENTS: 'enrollments',
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

// Routes within the project dashboard
const projectClientDashboardRoutes = {
  OVERVIEW: 'overview',
  EDIT_PROJECT: 'overview/edit',

  // Enrollment-related
  ENROLLMENTS: 'enrollments',
  ADD_SERVICES: 'add-services',
  REFERRALS: 'referrals',

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
  MANAGE_INVENTORY_BEDS: 'inventory/:inventoryId/beds',
};

// Set up full dashboard routes so we can use `generateSafePath`
type SubRoutesType = keyof typeof clientClientDashboardRoutes;
let key: SubRoutesType;
for (key in clientClientDashboardRoutes) {
  clientClientDashboardRoutes[
    key
  ] = `${Routes.CLIENT_DASHBOARD}/${clientClientDashboardRoutes[key]}`;
}
type DashboardSubRoutesType = keyof typeof projectClientDashboardRoutes;
let key2: DashboardSubRoutesType;
for (key2 in projectClientDashboardRoutes) {
  projectClientDashboardRoutes[
    key2
  ] = `${Routes.PROJECT}/${projectClientDashboardRoutes[key2]}`;
}

export const ClientDashboardRoutes: { [k in SubRoutesType]: string } =
  clientClientDashboardRoutes;

export const ProjectDashboardRoutes: {
  [k in DashboardSubRoutesType]: string;
} = projectClientDashboardRoutes;

export const HIDE_NAV_ROUTES = [
  ClientDashboardRoutes.VIEW_ASSESSMENT,
  ClientDashboardRoutes.NEW_ASSESSMENT,
];

export const FOCUS_MODE_ROUTES = [
  {
    route: ClientDashboardRoutes.HOUSEHOLD_EXIT,
    previous: ClientDashboardRoutes.VIEW_ENROLLMENT,
  },
  {
    route: ClientDashboardRoutes.HOUSEHOLD_INTAKE,
    previous: ClientDashboardRoutes.VIEW_ENROLLMENT,
  },
];
