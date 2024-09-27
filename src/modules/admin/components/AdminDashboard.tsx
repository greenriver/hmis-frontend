import { Container, Typography } from '@mui/material';
import { useMemo } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { AdminDashboardRoutes } from '@/app/routes';
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
import useCurrentPath from '@/hooks/useCurrentPath';
import { useDashboardState } from '@/hooks/useDashboardState';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useRootPermissions } from '@/modules/permissions/useHasPermissionsHooks';
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
    id: 'config',
    title: 'Config',
    type: 'category',
    items: [
      {
        id: 'forms',
        title: 'Forms',
        path: AdminDashboardRoutes.FORMS,
        permissions: ['canConfigureDataCollection'],
      },
      {
        id: 'services',
        title: 'Services',
        path: AdminDashboardRoutes.CONFIGURE_SERVICES,
        permissions: ['canConfigureDataCollection'],
      },
      {
        id: 'project-config',
        title: 'Project',
        path: AdminDashboardRoutes.PROJECT_CONFIG,
        permissions: ['canConfigureDataCollection'],
      },
    ],
  },
];

export const PERMISSIONS_GRANTING_ADMIN_DASHBOARD_ACCESS = navItems
  .flatMap((group) => group.items)
  .flatMap((item) => item?.permissions || []);

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
  const isMobile = useIsMobile();

  const formEditorContentSx = {
    px: 0,
    py: 0,
    maxWidth: '100%',
  };

  const currentPath = useCurrentPath();

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
      contentSx={
        // The form editor needs to take up the whole page because of its layout, so the parent gets custom sx
        currentPath === AdminDashboardRoutes.EDIT_FORM
          ? formEditorContentSx
          : {}
      }
      // On desktop, 'Admin' appears in the ProjectNavHeader, so omit it from the nav label.
      // On mobile, include it. We can remove this special case if we add the ProjectNavHeader info back on mobile.
      navLabel={isMobile ? 'Admin' : ''}
      {...dashboardState}
    >
      <Container
        maxWidth={currentPath === AdminDashboardRoutes.EDIT_FORM ? false : 'xl'}
        disableGutters
      >
        <Outlet />
      </Container>
    </DashboardContentContainer>
  );
};

export default AdminDashboard;
