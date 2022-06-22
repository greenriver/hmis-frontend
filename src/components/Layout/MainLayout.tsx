import {
  AppBar,
  CssBaseline,
  Toolbar,
  Typography,
  Grid,
  Link,
  Button,
} from '@mui/material';
import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';

import Loading from '@/components/elements/Loading';
import useAuth from '@/modules/auth/hooks/useAuth';

type MainLayoutProps = {
  children: React.ReactNode;
};

const MainLayout = ({ children }: MainLayoutProps) => {
  const { logout, user, loading } = useAuth();
  if (loading || !user) return <Loading />;

  return (
    <React.Fragment>
      <AppBar
        position='static'
        color='default'
        elevation={0}
        sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
      >
        <Toolbar sx={{ flexWrap: 'wrap' }}>
          <Typography variant='h6' color='inherit' noWrap sx={{ flexGrow: 1 }}>
            {import.meta.env.VITE_APP_NAME}
          </Typography>
          <Link
            variant='body2'
            color='primary'
            component={RouterLink}
            to='/'
            sx={{ ml: 2 }}
          >
            Search
          </Link>
          <Link
            variant='body2'
            color='primary'
            component={RouterLink}
            to='/intake'
            sx={{ ml: 2 }}
          >
            New Client
          </Link>
          <Typography variant='body2' sx={{ ml: 8 }}>
            {user.name}
          </Typography>
          <Button variant='text' sx={{ ml: 2 }} onClick={logout}>
            Sign Out
          </Button>
        </Toolbar>
      </AppBar>

      <Grid container component='main' sx={{ height: '100vh' }}>
        <CssBaseline />
        <Grid item xs={false} sm={4} md={10}>
          {children}
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default MainLayout;
