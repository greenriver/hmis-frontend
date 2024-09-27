import { alpha, Theme } from '@mui/material';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Routes } from '@/app/routes';
import ButtonLink from '@/components/elements/ButtonLink';
import { NavItem } from '@/components/layout/dashboard/sideNav/types';
import MobileMenuItem from '@/components/layout/nav/MobileMenuItem';
import { PERMISSIONS_GRANTING_ADMIN_DASHBOARD_ACCESS } from '@/modules/admin/components/AdminDashboard';
import { RootPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { RootPermissionsFragment } from '@/types/gqlTypes';

export const TOOLBAR_MENU_ITEMS: (NavItem<RootPermissionsFragment> & {
  activeItemPathIncludes: string;
})[] = [
  {
    permissions: ['canViewMyDashboard'],
    path: Routes.MY_DASHBOARD,
    id: 'navToMyDashboard',
    activeItemPathIncludes: 'my-dashboard',
    title: 'My Dashboard',
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
    permissions: PERMISSIONS_GRANTING_ADMIN_DASHBOARD_ACCESS,
    path: Routes.ADMIN,
    permissionMode: 'any',
    id: 'navToAdmin',
    activeItemPathIncludes: 'admin',
    title: 'Admin',
  },
];

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
      case 'my-dashboard':
        return 'my-dashboard';
      default:
        return null;
    }
  }, [pathname]);
};

interface ToolbarMenuProps {
  mobile?: boolean;
}
const ToolbarMenu: React.FC<ToolbarMenuProps> = ({ mobile }) => {
  const activeItem = useActiveNavItem();

  return TOOLBAR_MENU_ITEMS.map((item) => {
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
          color: 'text.primary',
          backgroundColor:
            activeItem === item.activeItemPathIncludes
              ? (theme: Theme) => alpha(theme.palette.links, 0.1)
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
