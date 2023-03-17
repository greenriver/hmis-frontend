import { AppBar, Box, Chip, CssBaseline, Toolbar } from '@mui/material';
import * as React from 'react';

import ButtonLink from '../elements/ButtonLink';
import RouterLink from '../elements/RouterLink';

import {
  APP_BAR_HEIGHT,
  OP_LINK_BAR_HEIGHT,
  SHOW_OP_LINK_BAR,
} from './layoutConstants';
import UserMenu from './UserMenu';
import WarehouseLinkBar from './WarehouseLinkBar';

import Loading from '@/components/elements/Loading';
import useAuth from '@/modules/auth/hooks/useAuth';
import { RootPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import OmniSearch from '@/modules/search/components/OmniSearch';
import { Routes } from '@/routes/routes';

interface Props {
  children: React.ReactNode;
}

const MainLayout: React.FC<Props> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading || !user) return <Loading />;

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
            color='secondary'
            noWrap
            underline='none'
            to='/'
          >
            {import.meta.env.PUBLIC_APP_NAME}
            {import.meta.env.MODE === 'staging' &&
              import.meta.env.PUBLIC_GIT_COMMIT_HASH && (
                <Chip
                  label={import.meta.env.PUBLIC_GIT_COMMIT_HASH}
                  size='small'
                  variant='outlined'
                  sx={{ ml: 2 }}
                />
              )}
          </RouterLink>
          <Box display='flex' sx={{ flexGrow: 1 }}></Box>
          <RootPermissionsFilter permissions={'canViewClients'}>
            <ButtonLink
              variant='text'
              to='/'
              color='secondary'
              data-testid='navToClients'
            >
              Clients
            </ButtonLink>
          </RootPermissionsFilter>
          <ButtonLink
            variant='text'
            to={Routes.ALL_PROJECTS}
            color='secondary'
            data-testid='navToProjects'
          >
            Projects
          </ButtonLink>
          <Box>
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
