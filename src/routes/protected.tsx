import { Box, Button, List, ListItemText, Typography } from '@mui/material';
import { Suspense, useState } from 'react';
import { Navigate } from 'react-router-dom';

import * as sessionsApi from '../api/sessions';

import { MainLayout } from '@/components/Layout';
import useAuth from '@/hooks/useAuth';

const App = () => {
  const { logout, user, loading } = useAuth();
  const [projects, setProjects] = useState<string[]>();
  if (loading || !user) return <div>Loading...</div>;

  function getProjects() {
    setProjects(undefined);
    sessionsApi
      .getProjects(['es', 'so'])
      .then((result: string[]) => {
        setProjects(result);
      })
      .catch(() => {});
  }

  return (
    <MainLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <Box sx={{ marginLeft: 4 }}>
          <Typography mt={2}>Logged in as {user.name}</Typography>
          <Button
            variant='contained'
            sx={{ mt: 3, mb: 2 }}
            onClick={getProjects}
          >
            Fetch Project List
          </Button>
          <Button
            variant='contained'
            sx={{ ml: 3, mt: 3, mb: 2 }}
            onClick={logout}
          >
            Sign Out
          </Button>
          {projects && (
            <List>
              {projects.map((text, i) => (
                <ListItemText key={i} primary={text} />
              ))}
            </List>
          )}
        </Box>
      </Suspense>
    </MainLayout>
  );
};

export const protectedRoutes = [
  {
    path: '/',
    element: <App />,
    children: [
      // { path: '/discussions/*', element: <DiscussionsRoutes /> },
      // { path: '/users', element: <Users /> },
      // { path: '/profile', element: <Profile /> },
      // { path: '/', element: <Dashboard /> },
      { path: '*', element: <Navigate to='.' /> },
    ],
  },
];
