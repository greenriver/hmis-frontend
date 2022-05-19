import {
  AppBar,
  Button,
  CssBaseline,
  ListItemButton,
  Toolbar,
  Typography,
  ListItemText,
  Divider,
  Paper,
  List,
  Grid,
  Box,
} from '@mui/material';
import * as React from 'react';

// import logo from '@/assets/logo.svg';
// import { useAuth } from '@/lib/auth';
// import { useAuthorization, ROLES } from '@/lib/authorization';

type MainLayoutProps = {
  children: React.ReactNode;
};

export const MainLayout = ({ children }: MainLayoutProps) => {
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
          <Button href='#' variant='outlined' sx={{ my: 1, mx: 1.5 }}>
            Log Out
          </Button>
        </Toolbar>
      </AppBar>

      <Grid container component='main' sx={{ height: '100vh' }}>
        <CssBaseline />
        <Grid item xs={false} sm={4} md={10}>
          {children}
        </Grid>
        <Grid item xs={12} sm={8} md={2} component={Paper} elevation={2} square>
          <Box
            sx={{
              my: 4,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'left',
            }}
          >
            <List component='nav'>
              <ListItemButton>
                <ListItemText primary='Dashboard' />
              </ListItemButton>
              <ListItemButton>
                <ListItemText primary='Reports' />
              </ListItemButton>
              <ListItemButton>
                <ListItemText primary='Clients' />
              </ListItemButton>
              <Divider sx={{ my: 1 }} />
              <ListItemButton>
                <ListItemText primary='My Account' />
              </ListItemButton>
              <ListItemButton>
                <ListItemText primary='Support' />
              </ListItemButton>
            </List>
          </Box>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};
