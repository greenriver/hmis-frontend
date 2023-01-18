export const Routes = {
  CREATE_CLIENT: '/client/new',
  CLIENT_DASHBOARD: '/client/:clientId',
  ALL_PROJECTS: '/projects',
  PROJECT: '/projects/:projectId',
  EDIT_PROJECT: '/projects/:projectId/edit',
  NEW_INVENTORY: '/projects/:projectId/inventory/new',
  EDIT_INVENTORY: '/projects/:projectId/inventory/:inventoryId/edit',
  MANAGE_INVENTORY_BEDS: '/projects/:projectId/inventory/:inventoryId/beds',
  NEW_FUNDER: '/projects/:projectId/funder/new',
  EDIT_FUNDER: '/projects/:projectId/funder/:funderId/edit',
  NEW_COC: '/projects/:projectId/coc/new',
  EDIT_COC: '/projects/:projectId/coc/:cocId/edit',
  ORGANIZATION: '/organizations/:organizationId',
  EDIT_ORGANIZATION: '/organizations/:organizationId/edit',
  CREATE_PROJECT: '/organizations/:organizationId/new-project',
  CREATE_ORGANIZATION: '/projects/new-organization',
} as const;

// Routes within the client dashboard
const subRoutes = {
  PROFILE: 'profile',
  EDIT: 'profile/edit',
  NEW_ENROLLMENT: 'enrollments/new',
  VIEW_ENROLLMENT: 'enrollments/:enrollmentId',
  EDIT_HOUSEHOLD: 'enrollments/:enrollmentId/edit-household',
  NEW_ASSESSMENT: 'enrollments/:enrollmentId/assessments/:assessmentRole/new',
  VIEW_ASSESSMENT: 'enrollments/:enrollmentId/assessments/:assessmentId',
  EDIT_ASSESSMENT: 'enrollments/:enrollmentId/assessments/:assessmentId/edit',
  ALL_ENROLLMENTS: 'enrollments',
  HISTORY: 'history',
  ASSESSMENTS: 'assessments',
  NOTES: 'notes',
  FILES: 'files',
  CONTACT: 'contact',
  LOCATIONS: 'locations',
  REFERRALS: 'referrals',
};

// Add prefix "/client/:clientId" to all, so we can use `generateSafePath`
type SubRoutesType = keyof typeof subRoutes;
let key: SubRoutesType;
for (key in subRoutes) {
  subRoutes[key] = `${Routes.CLIENT_DASHBOARD}/${subRoutes[key]}`;
}

export const DashboardRoutes: { [k in SubRoutesType]: string } = subRoutes;
