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
        id: 'ce',
        type: 'category',
        title: 'Coordinated Entry',
        items: [
          {
            id: 'available-units',
            title: 'Available Units',
            path: AdminDashboardRoutes.AVAILABLE_UNITS,
            permissions: ['canAdministrateCoordinatedEntry'],
            hide: !globalFeatureFlags?.coordinatedEntryEnabled,
          },
          {
            id: 'default-contacts',
            title: 'Default Contacts',
            path: AdminDashboardRoutes.DEFAULT_CONTACTS,
            permissions: ['canAdministrateCoordinatedEntry'],
            hide: !globalFeatureFlags?.coordinatedEntryEnabled,
          },
          {
            id: 'referrals',
            title: 'Referrals',
            path: AdminDashboardRoutes.REFERRALS,
            permissions: ['canAdministrateCoordinatedEntry'],
            hide: !globalFeatureFlags?.coordinatedEntryEnabled,
          },
          {
            id: 'eligible-clients',
            title: 'Eligible Clients',
            path: AdminDashboardRoutes.ELIGIBLE_CLIENTS,
            permissions: ['canAdministrateCoordinatedEntry'],
            hide: !globalFeatureFlags?.coordinatedEntryEnabled,
          },
          {
            id: 'denials',
            title: 'Denials',
            path: AdminDashboardRoutes.AC_DENIALS,
            permissions: ['canManageDeniedReferrals'],
          },
        ],
      },
      {
        id: 'users',
        type: 'category',
        title: 'Users',
        items: [
          {
            id: 'users',
            title: 'Users',
            path: AdminDashboardRoutes.USERS,
            permissions: ['canImpersonateUsers', 'canAuditUsers'],
            permissionMode: 'any',
          },
        ],
      },
      {
        id: 'admin-nav',
        type: 'category',
        title: 'Records',
        items: [
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
            title: 'Projects',
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
