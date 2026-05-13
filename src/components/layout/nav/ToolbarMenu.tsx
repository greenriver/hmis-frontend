import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import ButtonLink from '@/components/elements/ButtonLink';
import { NavItem } from '@/components/layout/dashboard/sideNav/types';
import MobileMenuItem from '@/components/layout/nav/MobileMenuItem';
import { useAdminDashboardNavItems } from '@/modules/admin/hooks/useAdminDashboardNavItems';
import { RootPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { useRootPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { Routes } from '@/routes/routes';
import {
  RootPermissionsFragment,
  useGetUserDashboardConfigQuery,
} from '@/types/gqlTypes';

export const useActiveNavItem = () => {
  const { pathname } = useLocation();
  return React.useMemo(() => {
    const val = pathname.split('/').find((s) => !!s);
    switch (val) {
      case undefined:
      case 'client':
        return 'client';
      case 'projects':
      case 'organizations':
        return 'project';
      case 'admin':
        return 'admin';
      case 'dashboard':
        return 'dashboard';
      case 'referrals':
        return 'referrals';
      default:
        return null;
    }
  }, [pathname]);
};

interface ToolbarMenuProps {
  mobile?: boolean;
}
const ToolbarMenu: React.FC<ToolbarMenuProps> = ({ mobile }) => {
  const { data: userDashboardConfigData } = useGetUserDashboardConfigQuery();

  const showUserDashboard = useMemo(() => {
    if (!userDashboardConfigData) return false;
    const { userDashboardConfig } = userDashboardConfigData.userDashboard;
    return (
      userDashboardConfig.showReferrals ||
      userDashboardConfig.showStaffAssignment
    );
  }, [userDashboardConfigData]);

  const { showAdminDashboard } = useAdminDashboardNavItems();

  const [access] = useRootPermissions();

  const baseMenuItems: (Required<
    Pick<NavItem<RootPermissionsFragment>, 'path'>
  > &
    NavItem<RootPermissionsFragment> & {
      activeItemPathIncludes: string;
    })[] = useMemo(() => {
    return [
      {
        hide: !showUserDashboard,
        path: Routes.USER_DASHBOARD,
        id: 'navToUserDashboard',
        activeItemPathIncludes: 'dashboard',
        title: 'Dashboard',
      },
      {
        permissions: ['canViewClients'],
        path: '/',
        id: 'navToClients',
        activeItemPathIncludes: 'client',
        title: 'Clients',
      },
      {
        path: Routes.ALL_PROJECTS,
        id: 'navToProjects',
        activeItemPathIncludes: 'project',
        title: 'Projects',
      },
      {
        path: Routes.REFERRALS,
        id: 'navToReferrals',
        activeItemPathIncludes: 'referrals',
        title: 'Referrals',
        hide: !access?.canIndexReferrals,
      },
      {
        path: Routes.ADMIN,
        id: 'navToAdmin',
        activeItemPathIncludes: 'admin',
        title: 'Admin',
        hide: !showAdminDashboard,
      },
    ];
  }, [showAdminDashboard, showUserDashboard, access?.canIndexReferrals]);

  const activeItem = useActiveNavItem();

  return baseMenuItems
    .filter((item) => !item.hide)
    .map((item) => {
      let navItem = mobile ? (
        <li key={item.id}>
          <MobileMenuItem
            title={item.title as string}
            selected={activeItem === item.activeItemPathIncludes}
            path={item.path}
          />
        </li>
      ) : (
        <ButtonLink
          variant='text'
          to={item.path}
          data-testid={item.id}
          sx={{
            fontWeight: 600, // FIXME custom typography, should standardize
            fontSize: 14,
            px: { xs: 0.5, lg: 2 },
            backgroundColor:
              activeItem === item.activeItemPathIncludes
                ? 'primary.100' // selected state
                : undefined,
          }}
          key={item.id}
        >
          {item.title}
        </ButtonLink>
      );

      if (item.permissions) {
        navItem = (
          <RootPermissionsFilter
            key={item.id}
            permissions={item.permissions}
            mode={item.permissionMode}
          >
            {navItem}
          </RootPermissionsFilter>
        );
      }

      return navItem;
    });
};

export default ToolbarMenu;
