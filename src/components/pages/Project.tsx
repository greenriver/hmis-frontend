import { Button, Grid, Link, Paper, Stack, Typography } from '@mui/material';
import { generatePath, Link as RouterLink, useParams } from 'react-router-dom';

import Breadcrumbs from '../elements/Breadcrumbs';
import Loading from '../elements/Loading';

import ProjectDetails from '@/modules/inventory/components/ProjectDetails';
import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
import { useProjectCrumbs } from '@/modules/inventory/components/useProjectCrumbs';
import { Routes } from '@/routes/routes';

const Project = () => {
  const { projectId } = useParams() as {
    projectId: string;
  };

  const [crumbs, loading, project] = useProjectCrumbs();
  if (loading) return <Loading />;
  if (!crumbs || !project) throw Error('Project not found');

  return (
    <ProjectLayout>
      <Breadcrumbs crumbs={crumbs} />
      <Typography variant='h3' sx={{ mb: 4 }}>
        {project.projectName}
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={9}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant='h6' sx={{ mb: 2 }}>
              Project Details
            </Typography>
            <ProjectDetails project={project} />
          </Paper>
        </Grid>
        <Grid item xs>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Stack spacing={2}>
              <Typography variant='h6'>Add to Project</Typography>
              <Button
                variant='outlined'
                color='secondary'
                sx={{ pl: 3, justifyContent: 'left' }}
                component={RouterLink}
                to=''
              >
                + Add Inventory
              </Button>
              <Button
                variant='outlined'
                color='secondary'
                sx={{ pl: 3, justifyContent: 'left' }}
                component={RouterLink}
                to=''
              >
                + Add Funding Source
              </Button>
              <Button
                variant='outlined'
                color='secondary'
                sx={{ pl: 3, justifyContent: 'left' }}
                component={RouterLink}
                to=''
              >
                + Add Project CoC
              </Button>
            </Stack>
          </Paper>
          {project.contactInformation && (
            <Paper sx={{ p: 2, mb: 3 }}>
              <Stack spacing={2}>
                <Typography variant='h6'>Project Contact</Typography>
                <Typography variant='body2'>
                  {project.contactInformation}
                </Typography>
              </Stack>
            </Paper>
          )}
          <Paper sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Link
                component={RouterLink}
                color='text.secondary'
                to={generatePath(Routes.EDIT_PROJECT, {
                  projectId,
                })}
              >
                Edit Project
              </Link>
              <Link color='text.secondary' component={RouterLink} to=''>
                Delete Project
              </Link>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </ProjectLayout>
  );
};
export default Project;
