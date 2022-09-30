import { Button, Grid, Paper, Stack, Typography } from '@mui/material';
import { generatePath, Link as RouterLink } from 'react-router-dom';

import Loading from '../elements/Loading';

import GroupedProjectTable from '@/modules/inventory/components/GroupedProjectTable';
import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
import { Routes } from '@/routes/routes';
import { useGetOrganizationsAndProjectsQuery } from '@/types/gqlTypes';
const AllProjects = () => {
  const { data, loading, error } = useGetOrganizationsAndProjectsQuery();

  if (loading) return <Loading />;
  if (error) throw error;

  return (
    <ProjectLayout>
      <Typography variant='h5' sx={{ mb: 2 }}>
        Organizations
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={9}>
          {data?.organizations && (
            <GroupedProjectTable organizations={data?.organizations} />
          )}
        </Grid>
        <Grid item xs>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Stack spacing={2}>
              <Typography variant='h6'>Actions</Typography>
              <Button
                variant='outlined'
                color='secondary'
                sx={{ pl: 3, justifyContent: 'left' }}
                component={RouterLink}
                to={generatePath(Routes.CREATE_ORGANIZATION)}
              >
                + Add Organization
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </ProjectLayout>
  );
};
export default AllProjects;
