import { Container, Typography } from '@mui/material';
import { useMemo } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import Loading from '@/components/elements/Loading';
import ContextHeaderContent from '@/components/layout/dashboard/contextHeader/ContextHeaderContent';
import {
  useAdminBreadcrumbConfig,
  useDashboardBreadcrumbs,
} from '@/components/layout/dashboard/contextHeader/useDashboardBreadcrumbs';
import DashboardContentContainer from '@/components/layout/dashboard/DashboardContentContainer';
import { firstNavItemWithAccess } from '@/components/layout/dashboard/sideNav/navUtil';
import SideNavMenu from '@/components/layout/dashboard/sideNav/SideNavMenu';
import { NavItem } from '@/components/layout/dashboard/sideNav/types';
import NotFound from '@/components/pages/NotFound';
import { useDashboardState } from '@/hooks/useDashboardState';
import { useRootPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { AdminDashboardRoutes } from '@/routes/routes';
import { RootPermissionsFragment } from '@/types/gqlTypes';

const ProjectNavHeader: React.FC = () => {
  return (
    <Typography
      variant='h5'
      sx={({ typography }) => ({ fontWeight: typography.fontWeightBold })}
    >
      Admin
    </Typography>
  );
};

const navItems: NavItem<RootPermissionsFragment>[] = [
  {
    id: 'admin-nav',
    type: 'category',
    items: [
      {
        id: 'denials',
        title: 'Denials',
        path: AdminDashboardRoutes.AC_DENIALS,
        permissions: ['canManageDeniedReferrals'],
      },
      {
        id: 'users',
        title: 'Users',
        path: AdminDashboardRoutes.USERS,
        permissions: ['canImpersonateUsers', 'canAuditUsers'],
        permissionMode: 'any',
      },
      {
        id: 'merge-clients',
        title: 'Client Merge History',
        path: AdminDashboardRoutes.CLIENT_MERGE_HISTORY,
        permissions: ['canMergeClients'],
      },
    ],
  },
  {
    id: 'admin',
    title: 'Admin',
    type: 'category',
    items: [
      {
        id: 'forms',
        title: 'Form Rules',
        path: AdminDashboardRoutes.CONFIGURE_FORM_RULES,
        permissions: ['canConfigureDataCollection'],
      },
      {
        id: 'services',
        title: 'Services',
        path: AdminDashboardRoutes.CONFIGURE_SERVICES,
        permissions: ['canConfigureDataCollection'],
      },
    ],
  },
];

// redirect to whichever admin page that the user has access to
export const AdminLandingPage = () => {
  const [access, { loading, error }] = useRootPermissions();

  const pageWithAccess = useMemo(
    () => (access ? firstNavItemWithAccess(navItems, access) : undefined),
    [access]
  );

  if (!access && loading) return <Loading />;

  if (error) throw error;
  if (!access) return null;

  if (pageWithAccess?.path) {
    return <Navigate to={pageWithAccess.path} replace />;
  }

  return null;
};

const AdminDashboard: React.FC = () => {
  const [access] = useRootPermissions();
  const dashboardState = useDashboardState();
  const breadCrumbConfig = useAdminBreadcrumbConfig();
  const breadcrumbs = useDashboardBreadcrumbs(breadCrumbConfig);

  if (!access) return <NotFound />;

  return (
    <DashboardContentContainer
      navHeader={<ProjectNavHeader />}
      contextHeader={<ContextHeaderContent breadcrumbs={breadcrumbs} />}
      sidebar={
        <SideNavMenu<RootPermissionsFragment>
          items={navItems}
          access={access}
        />
      }
      {...dashboardState}
    >
      <Container maxWidth='xl' sx={{ pb: 6 }}>
        <Outlet />
      </Container>
    </DashboardContentContainer>
  );
};

export default AdminDashboard;
