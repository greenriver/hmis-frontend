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
            id: 'denials',
            title: 'Denials',
            path: AdminDashboardRoutes.AC_DENIALS,
            permissions: ['canManageDeniedReferrals'],
          },
          {
            id: 'default-contacts',
            title: 'Default Contacts',
            path: AdminDashboardRoutes.DEFAULT_CONTACTS,
            permissions: ['canManageCeDefaultContacts'],
            hide: !globalFeatureFlags?.coordinatedEntryEnabled,
          },
          {
            id: 'eligibility-rules',
            title: 'Eligibility Rules',
            path: AdminDashboardRoutes.ELIGIBILITY_RULES,
            // TODO(#7544): swap to canAdministrateCoordinatedEntry
            permissions: ['canAdministrateConfig'],
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
            permissions: ['canManageFormRules'],
          },
          {
            id: 'services',
            title: 'Services',
            path: AdminDashboardRoutes.CONFIGURE_SERVICES,
            permissions: ['canManageServices'],
          },
          {
            id: 'project-config',
            title: 'Projects',
            path: AdminDashboardRoutes.PROJECT_CONFIG,
            permissions: ['canManageProjectConfigs'],
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
