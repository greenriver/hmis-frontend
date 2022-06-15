import { AppBar, CssBaseline, Toolbar, Typography, Grid } from '@mui/material';
import * as React from 'react';

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
