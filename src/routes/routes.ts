export const Routes = {
  CREATE_CLIENT: '/new-client',
  CLIENT_DASHBOARD: '/client/:clientId',
  ALL_PROJECTS: '/projects',
  PROJECT: '/projects/:projectId',
  EDIT_PROJECT: '/projects/:projectId/edit',
  ORGANIZATION: '/organizations/:organizationId',
} as const;

// Routes within the client dashboard
const subRoutes = {
  PROFILE: 'profile',
  NEW_ENROLLMENT: 'enrollments/new',
  VIEW_ENROLLMENT: 'enrollments/:enrollmentId',
  EDIT_HOUSEHOLD: 'enrollments/:enrollmentId/edit-household',
  NEW_ASSESSMENT: 'enrollments/:enrollmentId/new-assessment/:assessmentType',
  VIEW_ASSESSMENT: 'enrollments/:enrollmentId/assessment/:assessmentId',
  ALL_ENROLLMENTS: 'enrollments',
  HISTORY: 'history',
  ASSESSMENTS: 'assessments',
  NOTES: 'notes',
  FILES: 'files',
  CONTACT: 'contact',
  LOCATIONS: 'locations',
  REFERRALS: 'referrals',
};

// Add prefix "/client/:clientId" to all, so we can use `generatePath`
type SubRoutesType = keyof typeof subRoutes;
let key: SubRoutesType;
for (key in subRoutes) {
  subRoutes[key] = `${Routes.CLIENT_DASHBOARD}/${subRoutes[key]}`;
}

export const DashboardRoutes: { [k in SubRoutesType]: string } = subRoutes;
