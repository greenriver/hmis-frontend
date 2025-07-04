import { Container } from '@mui/material';
import { useMemo, useState } from 'react';
import { Navigate, Outlet, useOutletContext } from 'react-router-dom';

import Loading from '@/components/elements/Loading';
import ContextHeaderContent from '@/components/layout/dashboard/contextHeader/ContextHeaderContent';
import {
  useAdminBreadcrumbConfig,
  useDashboardBreadcrumbs,
} from '@/components/layout/dashboard/contextHeader/useDashboardBreadcrumbs';
import DashboardContentContainer from '@/components/layout/dashboard/DashboardContentContainer';
import SideNavMenu from '@/components/layout/dashboard/sideNav/SideNavMenu';
import NotFound from '@/components/pages/NotFound';
import { useDashboardState } from '@/hooks/useDashboardState';
import { useAdminDashboardNavItems } from '@/modules/admin/hooks/useAdminDashboardNavItems';
import { useRootPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { RootPermissionsFragment } from '@/types/gqlTypes';

// redirect to whichever admin page that the user has access to
export const AdminLandingPage = () => {
  const [access, { loading, error }] = useRootPermissions();

  const { firstAccessiblePagePath } = useAdminDashboardNavItems();

  if (!access && loading) return <Loading />;

  if (error) throw error;
  if (!access) return null;

  if (firstAccessiblePagePath) {
    return <Navigate to={firstAccessiblePagePath} replace />;
  }

  return null;
};

const AdminDashboard: React.FC = () => {
  const [access] = useRootPermissions();
  const { noPadding, ...dashboardState } = useDashboardState();
  // allow pages to "override" the default breadcrumb text
  const [breadcrumbOverrides, overrideBreadcrumbTitles] = useState<
    Record<string, string> | undefined
  >();

  const breadCrumbConfig = useAdminBreadcrumbConfig();
  const breadcrumbs = useDashboardBreadcrumbs(
    breadCrumbConfig,
    breadcrumbOverrides
  );

  const { navItems, showAdminDashboard } = useAdminDashboardNavItems();

  const outletContext = useMemo(() => {
    return {
      overrideBreadcrumbTitles,
    };
  }, []);

  if (!access || !showAdminDashboard) return <NotFound />;

  return (
    <DashboardContentContainer
      contextHeader={<ContextHeaderContent breadcrumbs={breadcrumbs} />}
      sidebar={
        <SideNavMenu<RootPermissionsFragment>
          items={navItems}
          access={access}
        />
      }
      noPadding={noPadding}
      navLabel={'Admin'}
      {...dashboardState}
    >
      <Container maxWidth={noPadding ? false : 'xl'} disableGutters>
        <Outlet context={outletContext} />
      </Container>
    </DashboardContentContainer>
  );
};

export type AdminDashboardContext = {
  overrideBreadcrumbTitles: (crumbs: any) => void;
};

export const useAdminDashboardContext = () => {
  return useOutletContext<AdminDashboardContext>();
};

export default AdminDashboard;
