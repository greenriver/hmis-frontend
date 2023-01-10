import {
  AppBar,
  Box,
  Button,
  Chip,
  CssBaseline,
  Toolbar,
  Typography,
} from '@mui/material';
import * as React from 'react';
import { useCallback } from 'react';

import ButtonLink from '../elements/ButtonLink';
import RouterLink from '../elements/RouterLink';

import WarehouseLinkBar, { warehouseLinkBarHeight } from './WarehouseLinkBar';

import Loading from '@/components/elements/Loading';
import useAuth from '@/modules/auth/hooks/useAuth';
import OmniSearch from '@/modules/search/components/OmniSearch';
import { Routes } from '@/routes/routes';

interface Props {
  children: React.ReactNode;
}

const showWarehouseLinkBar =
  import.meta.env.MODE === 'staging' &&
  import.meta.env.PUBLIC_WAREHOUSE_URL &&
  import.meta.env.PUBLIC_CAS_URL;

const appBarHeight = 64;
export const STICKY_BAR_HEIGHT = showWarehouseLinkBar
  ? appBarHeight + warehouseLinkBarHeight
  : appBarHeight;

const MainLayout: React.FC<Props> = ({ children }) => {
  const { logout, user, loading } = useAuth();
  const logoutUser = useCallback(() => logout(true), [logout]);

  if (loading || !user) return <Loading />;

  return (
    <React.Fragment>
      {showWarehouseLinkBar && <WarehouseLinkBar />}
      <AppBar
        position='sticky'
        color='default'
        elevation={0}
        sx={{
          height: appBarHeight,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          top: showWarehouseLinkBar ? warehouseLinkBarHeight : 0,
        }}
      >
        {/* fixme: make responsive */}
        <Toolbar sx={{ flexWrap: 'none', overflow: 'hidden', gap: 2 }}>
          <RouterLink
            variant='h1'
            color='secondary'
            noWrap
            sx={{ flexGrow: 1 }}
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
          <ButtonLink
            variant='text'
            to='/'
            color='secondary'
            data-testid='navToClients'
          >
            Clients
          </ButtonLink>
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
          <Typography variant='body2'>{user.name}</Typography>
          <Button variant='text' onClick={logoutUser} color='secondary'>
            Sign Out
          </Button>
        </Toolbar>
      </AppBar>
      <CssBaseline />
      {children}
    </React.Fragment>
  );
};

export default MainLayout;
