import { AppBar, Box, CssBaseline, Toolbar } from '@mui/material';
import * as React from 'react';

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
import useAuth from '@/modules/auth/hooks/useAuth';
import { useHmisAppSettings } from '@/modules/hmisAppSettings/useHmisAppSettings';
import { RootPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import OmniSearch from '@/modules/search/components/OmniSearch';
import { Routes } from '@/routes/routes';
import { useGetRootPermissionsQuery } from '@/types/gqlTypes';

interface Props {
  children: React.ReactNode;
}

const MainLayout: React.FC<Props> = ({ children }) => {
  const { user, loading: userLoading } = useAuth();
  const { appName } = useHmisAppSettings();
  const isPrint = useIsPrintView();

  // Load root permissions into the cache before loading the page
  const {
    data,
    loading: permissionLoading,
    error,
  } = useGetRootPermissionsQuery();
  if (error) throw error;

  if (userLoading && !user) return <Loading />;
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

  const navItemSx = {
    fontSize: '1rem',
    fontWeight: 400,
    px: 2,
    ml: 1,
    color: 'text.primary',
  };
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
        }}
      >
        {/* fixme: make responsive */}
        <Toolbar sx={{ flexWrap: 'none', overflow: 'hidden', gap: 2 }}>
          <RouterLink
            variant='h1'
            noWrap
            underline='none'
            to='/'
            sx={{ textTransform: 'uppercase', color: 'secondary.main' }}
          >
            {appName || 'Open Path HMIS'}
          </RouterLink>
          <Box display='flex' sx={{ flexGrow: 1 }}></Box>
          <RootPermissionsFilter permissions={'canViewClients'}>
            <ButtonLink
              variant='text'
              to='/'
              data-testid='navToClients'
              sx={navItemSx}
            >
              Clients
            </ButtonLink>
          </RootPermissionsFilter>
          <ButtonLink
            variant='text'
            to={Routes.ALL_PROJECTS}
            data-testid='navToProjects'
            sx={navItemSx}
          >
            Projects
          </ButtonLink>
          <RootPermissionsFilter permissions={'canManageDeniedReferrals'}>
            <ButtonLink
              variant='text'
              to={Routes.ADMIN}
              data-testid='navToAdmin'
              sx={navItemSx}
            >
              Admin
            </ButtonLink>
          </RootPermissionsFilter>
          <Box sx={{ mx: 2 }}>
            <OmniSearch />
          </Box>
          <UserMenu />
        </Toolbar>
      </AppBar>
      <CssBaseline />
      {children}
    </React.Fragment>
  );
};

export default MainLayout;
