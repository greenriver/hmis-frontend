import { Grid, Paper, Stack, Typography } from '@mui/material';
import { generatePath, useParams } from 'react-router-dom';

import Breadcrumbs from '../elements/Breadcrumbs';
import ButtonLink from '../elements/ButtonLink';
import Loading from '../elements/Loading';
import RouterLink from '../elements/RouterLink';

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
              <ButtonLink
                variant='outlined'
                color='secondary'
                sx={{ pl: 3, justifyContent: 'left' }}
                to=''
              >
                + Add Inventory
              </ButtonLink>
              <ButtonLink
                variant='outlined'
                color='secondary'
                sx={{ pl: 3, justifyContent: 'left' }}
                to=''
              >
                + Add Funding Source
              </ButtonLink>
              <ButtonLink
                variant='outlined'
                color='secondary'
                sx={{ pl: 3, justifyContent: 'left' }}
                to=''
              >
                + Add Project CoC
              </ButtonLink>
            </Stack>
          </Paper>
          {project.contactInformation && (
            <Paper sx={{ p: 2, mb: 3 }}>
              <Stack spacing={2}>
                <Typography variant='h6'>Project Contact</Typography>
                <Typography variant='body2' sx={{ whiteSpace: 'pre-line' }}>
                  {project.contactInformation}
                </Typography>
              </Stack>
            </Paper>
          )}
          <Paper sx={{ p: 2 }}>
            <Stack spacing={1}>
              <RouterLink
                color='text.secondary'
                to={generatePath(Routes.EDIT_PROJECT, {
                  projectId,
                })}
              >
                Edit Project
              </RouterLink>
              <RouterLink color='text.secondary' to=''>
                Delete Project
              </RouterLink>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </ProjectLayout>
  );
};
export default Project;
