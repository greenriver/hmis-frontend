import {
  AppBar,
  Button,
  Chip,
  CssBaseline,
  Toolbar,
  Typography,
} from '@mui/material';
import * as React from 'react';
import { useCallback } from 'react';

import RouterLink from '../elements/RouterLink';

import WarehouseLinkBar from './WarehouseLinkBar';

import Loading from '@/components/elements/Loading';
import useAuth from '@/modules/auth/hooks/useAuth';
import { Routes } from '@/routes/routes';

interface Props {
  children: React.ReactNode;
}

const MainLayout: React.FC<Props> = ({ children }) => {
  const { logout, user, loading } = useAuth();
  const logoutUser = useCallback(() => logout(true), [logout]);

  if (loading || !user) return <Loading />;

  return (
    <React.Fragment>
      <WarehouseLinkBar />
      <AppBar
        position='static'
        color='default'
        elevation={0}
        sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
      >
        <Toolbar sx={{ flexWrap: 'wrap' }}>
          <RouterLink
            variant='h1'
            color='secondary'
            noWrap
            sx={{ flexGrow: 1 }}
            component={RouterLink}
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
          <RouterLink to='/' sx={{ ml: 2 }} color='secondary'>
            Dashboard
          </RouterLink>
          <RouterLink to={Routes.ALL_PROJECTS} sx={{ ml: 2 }} color='secondary'>
            Projects
          </RouterLink>
          <Typography variant='body2' sx={{ ml: 8 }}>
            {user.name}
          </Typography>
          <Button
            variant='text'
            sx={{ ml: 2 }}
            onClick={logoutUser}
            color='secondary'
          >
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
