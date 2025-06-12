import { useMemo } from 'react';
import { firstNavItemWithAccess } from '@/components/layout/dashboard/sideNav/navUtil';
import { NavItem } from '@/components/layout/dashboard/sideNav/types';
import { useGlobalFeatureFlags } from '@/hooks/useGlobalFeatureFlags';
import { useRootPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { AdminDashboardRoutes } from '@/routes/routes';
import { RootPermissionsFragment } from '@/types/gqlTypes';

export const useAdminDashboardNavItems = () => {
  const { globalFeatureFlags } = useGlobalFeatureFlags();

  const navItems: NavItem<RootPermissionsFragment>[] = useMemo(
    () => [
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
            id: 'coordinated-entry',
            title: 'Coordinated Entry',
            path: AdminDashboardRoutes.COORDINATED_ENTRY,
            permissions: ['canAdministrateCoordinatedEntry'],
            hide: !globalFeatureFlags?.coordinatedEntryEnabled,
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
    ],
    [globalFeatureFlags]
  );

  const [access] = useRootPermissions();

  // First page that the user has access to. If this is undefined, the user doesn't
  // have access to any admin pages, and the AdminDashboard should not render.
  const firstAccessiblePagePath = useMemo(
    () => (access ? firstNavItemWithAccess(navItems, access)?.path : undefined),
    [access, navItems]
  );

  return {
    navItems,
    firstAccessiblePagePath,
    showAdminDashboard: !!firstAccessiblePagePath,
  };
};
