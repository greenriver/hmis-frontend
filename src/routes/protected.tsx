/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { useLazyQuery } from '@apollo/client';
import { Box, Button, List, ListItemText, Typography } from '@mui/material';
import { Suspense } from 'react';
import { Navigate } from 'react-router-dom';

import { GET_PROJECTS } from '@/api/projects.gql';
import { MainLayout } from '@/components/Layout';
import useAuth from '@/hooks/useAuth';

const App = () => {
  const { logout, user, loading } = useAuth();
  const [getProjects, { data }] = useLazyQuery(GET_PROJECTS);

  if (loading || !user) return <div>Loading...</div>;

  return (
    <MainLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <Box sx={{ marginLeft: 4 }}>
          <Typography mt={2}>Logged in as {user.name}</Typography>
          <Button
            variant='contained'
            sx={{ mt: 3, mb: 2 }}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onClick={() => getProjects()}
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
          {data && (
            <List>
              {data.projects.map(
                ({ id, name, projectType }: Record<string, string>) => (
                  <ListItemText
                    key={id}
                    primary={`${name} (${projectType.toLowerCase()})`}
                  />
                )
              )}
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
