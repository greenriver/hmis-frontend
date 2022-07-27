import {
  AppBar,
  CssBaseline,
  Toolbar,
  Typography,
  Link,
  Button,
} from '@mui/material';
import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';

import Loading from '@/components/elements/Loading';
import useAuth from '@/modules/auth/hooks/useAuth';

interface Props {
  children: React.ReactNode;
}

const MainLayout: React.FC<Props> = ({ children }) => {
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
          <Link
            variant='h6'
            color='secondary'
            noWrap
            sx={{ flexGrow: 1 }}
            component={RouterLink}
            underline='none'
            to='/'
          >
            {import.meta.env.VITE_APP_NAME}
          </Link>
          <Link component={RouterLink} to='/' sx={{ ml: 2 }}>
            Search
          </Link>
          <Link component={RouterLink} to='/intake' sx={{ ml: 2 }}>
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
      <CssBaseline />
      {children}
    </React.Fragment>
  );
};

export default MainLayout;
