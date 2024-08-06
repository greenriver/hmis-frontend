import { alpha, lighten, MenuItem, SxProps, Theme } from '@mui/material';
import React, { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import ButtonLink from '@/components/elements/ButtonLink';
import RouterLink from '@/components/elements/RouterLink';
import { NavItem } from '@/components/layout/dashboard/sideNav/types';
import { useIsMobile } from '@/hooks/useIsMobile';
import { PERMISSIONS_GRANTING_ADMIN_DASHBOARD_ACCESS } from '@/modules/admin/components/AdminDashboard';
import { RootPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { Routes } from '@/routes/routes';
import { RootPermissionsFragment } from '@/types/gqlTypes';

export const TOOLBAR_MENU_ITEMS: (NavItem<RootPermissionsFragment> & {
  activeItemPathIncludes: string;
})[] = [
  {
    permissions: ['canEditEnrollments'],
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

export const useActiveNaveItem = () => {
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

const ToolbarMenu: React.FC = () => {
  const activeItem = useActiveNaveItem();
  const isMobile = useIsMobile();

  const navItemSx = useCallback(
    (selected: boolean): SxProps<Theme> => {
      return isMobile
        ? {
            py: 1,
            px: 3,
            textDecoration: 'none',
            textOverflow: 'ellipsis',
            overflowX: 'hidden',
            whiteSpace: 'nowrap',
            display: 'block',
            color: selected ? 'primary.main' : 'text.primary',
            fontWeight: selected ? 600 : 400,
            '&.Mui-focusVisible': {
              outlineOffset: '-2px',
            },
            backgroundColor: selected
              ? (theme: Theme) => lighten(theme.palette.primary.light, 0.9)
              : undefined,
            border: '2px solid transparent',
          }
        : {
            fontWeight: 600,
            fontSize: 14,
            px: { xs: 0.5, lg: 2 },
            color: 'text.primary',
            backgroundColor: selected
              ? (theme: Theme) => alpha(theme.palette.primary.light, 0.12)
              : undefined,
          };
    },
    [isMobile]
  );

  return TOOLBAR_MENU_ITEMS.map((item) => {
    let navItem = isMobile ? (
      <MenuItem
        component={RouterLink}
        to={item.path}
        sx={navItemSx(activeItem === item.activeItemPathIncludes)}
        data-testid={item.id}
        key={item.id}
      >
        {item.title}
      </MenuItem>
    ) : (
      <ButtonLink
        variant='text'
        to={item.path}
        data-testid={item.id}
        sx={navItemSx(activeItem === item.activeItemPathIncludes)}
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
