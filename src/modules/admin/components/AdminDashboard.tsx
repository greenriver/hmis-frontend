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
import SideNavMenu from '@/components/layout/dashboard/sideNav/SideNavMenu';
import { NavItem } from '@/components/layout/dashboard/sideNav/types';
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

type RootPermission = keyof Omit<RootPermissionsFragment, 'id' | '__typename'>;
type AdminPageConfig = NavItem & {
  permissions: RootPermission[];
  permissionMode?: 'any' | 'all';
};

const adminPages: AdminPageConfig[] = [
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
];

function canAccessPage(access: RootPermissionsFragment, page: AdminPageConfig) {
  if (page.permissions.length === 0) {
    return true;
  }
  if (page.permissionMode === 'any') {
    return page.permissions.some((perm) => access[perm]);
  }

  return page.permissions.every((perm) => access[perm]);
}

// redirect to whichever admin page that the user has access to
export const AdminLandingPage = () => {
  const [access, { loading, error }] = useRootPermissions();

  const pageWithAccess = useMemo(
    () =>
      adminPages.find(
        (page) => access && canAccessPage(access, page) && page.path
      ),
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

  const navItems: NavItem[] = useMemo(() => {
    return [
      {
        id: 'admin-nav',
        type: 'category',
        items: adminPages.map((page) => ({
          ...page,
          hide: !access || !canAccessPage(access, page),
        })),
      },
    ];
  }, [access]);

  const dashboardState = useDashboardState();

  const breadCrumbConfig = useAdminBreadcrumbConfig();
  const breadcrumbs = useDashboardBreadcrumbs(breadCrumbConfig);

  return (
    <DashboardContentContainer
      navHeader={<ProjectNavHeader />}
      contextHeader={<ContextHeaderContent breadcrumbs={breadcrumbs} />}
      sidebar={<SideNavMenu items={navItems} />}
      {...dashboardState}
    >
      <Container maxWidth='lg' sx={{ pb: 6 }}>
        <Outlet />
      </Container>
    </DashboardContentContainer>
  );
};

export default AdminDashboard;
