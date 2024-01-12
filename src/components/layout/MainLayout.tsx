import {
  AppBar,
  Box,
  CssBaseline,
  SxProps,
  Theme,
  Toolbar,
} from '@mui/material';
import * as React from 'react';

import { useLocation } from 'react-router-dom';
import ButtonLink from '../elements/ButtonLink';
import RouterLink from '../elements/RouterLink';

import {
  APP_BAR_HEIGHT,
  OP_LINK_BAR_HEIGHT,
  SHOW_OP_LINK_BAR,
} from './layoutConstants';
import PrintViewButton from './PrintViewButton';
import UserMenu from './UserMenu';
import WarehouseLinkBar from './WarehouseLinkBar';

import Loading from '@/components/elements/Loading';
import useIsPrintView from '@/hooks/useIsPrintView';
import { PERMISSIONS_GRANTING_ADMIN_DASHBOARD_ACCESS } from '@/modules/admin/components/AdminDashboard';
import { useHmisAppSettings } from '@/modules/hmisAppSettings/useHmisAppSettings';
import { RootPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import OmniSearch from '@/modules/search/components/OmniSearch';
import { Routes } from '@/routes/routes';
import { useGetRootPermissionsQuery } from '@/types/gqlTypes';

interface Props {
  children: React.ReactNode;
}

const MainLayout: React.FC<Props> = ({ children }) => {
  const { appName } = useHmisAppSettings();
  const isPrint = useIsPrintView();

  // Load root permissions into the cache before loading the page
  const {
    data,
    loading: permissionLoading,
    error,
  } = useGetRootPermissionsQuery();

  const { pathname } = useLocation();
  const activeItem = React.useMemo(() => {
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
      default:
        return null;
    }
  }, [pathname]);

  if (error) throw error;

  if (permissionLoading && !data) return <Loading />;

  if (isPrint)
    return (
      <>
        <CssBaseline />
        <Box
          sx={(theme) => ({
            position: 'fixed',
            right: theme.spacing(1),
            top: theme.spacing(1),
            backgroundColor: theme.palette.background.paper,
            '& > *': {
              boxShadow: `${theme.shadows[2]} !important`,
            },
            '@media print': {
              '&': {
                display: 'none',
              },
            },
          })}
        >
          <PrintViewButton exit />
        </Box>
        {children}
      </>
    );

  const navItemSx = (enabled: boolean): SxProps<Theme> => ({
    fontWeight: 600,
    fontSize: 14,
    px: 2,
    ml: 1,
    color: 'text.primary',
    backgroundColor: enabled ? (theme) => theme.palette.grey[100] : undefined,
  });

  return (
    <React.Fragment>
      {SHOW_OP_LINK_BAR && <WarehouseLinkBar />}
      <AppBar
        position='sticky'
        color='default'
        elevation={0}
        sx={{
          height: APP_BAR_HEIGHT,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          top: SHOW_OP_LINK_BAR ? OP_LINK_BAR_HEIGHT : 0,
          backgroundColor: 'white',
        }}
      >
        {/* fixme: make responsive */}
        <Toolbar sx={{ flexWrap: 'noWrap', overflow: 'hidden', gap: 1 }}>
          <RouterLink
            variant='h1'
            noWrap
            underline='none'
            to='/'
            sx={{
              color: 'text.primary',
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            {appName || 'Open Path HMIS'}
          </RouterLink>
          <Box display='flex' sx={{ flexGrow: 1 }}></Box>
          <RootPermissionsFilter permissions={'canViewClients'}>
            <ButtonLink
              variant='text'
              to='/'
              data-testid='navToClients'
              sx={navItemSx(activeItem === 'client')}
            >
              Clients
            </ButtonLink>
          </RootPermissionsFilter>
          <ButtonLink
            variant='text'
            to={Routes.ALL_PROJECTS}
            data-testid='navToProjects'
            sx={navItemSx(activeItem === 'project')}
          >
            Projects
          </ButtonLink>
          <RootPermissionsFilter
            permissions={PERMISSIONS_GRANTING_ADMIN_DASHBOARD_ACCESS}
            mode='any'
          >
            <ButtonLink
              variant='text'
              to={Routes.ADMIN}
              data-testid='navToAdmin'
              sx={navItemSx(activeItem === 'admin')}
            >
              Admin
            </ButtonLink>
          </RootPermissionsFilter>
          <OmniSearch />
          <UserMenu />
        </Toolbar>
      </AppBar>
      <CssBaseline />
      {children}
    </React.Fragment>
  );
};

export default MainLayout;
