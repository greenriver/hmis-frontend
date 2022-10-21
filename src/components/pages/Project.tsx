import { Alert, Grid, Paper, Stack, Typography } from '@mui/material';
import { addDays, isBefore } from 'date-fns';
import { generatePath, useParams } from 'react-router-dom';

import Breadcrumbs from '../elements/Breadcrumbs';
import ButtonLink from '../elements/ButtonLink';
import Loading from '../elements/Loading';
import MultilineTypography from '../elements/MultilineTypography';
import RouterLink from '../elements/RouterLink';

import { parseHmisDateString } from '@/modules/hmis/hmisUtil';
import FunderTable from '@/modules/inventory/components/FunderTable';
import InventoryTable from '@/modules/inventory/components/InventoryTable';
import ProjectCocTable from '@/modules/inventory/components/ProjectCocTable';
import ProjectDetails from '@/modules/inventory/components/ProjectDetails';
import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
import { useProjectCrumbs } from '@/modules/inventory/components/useProjectCrumbs';
import { Routes } from '@/routes/routes';
import { ProjectAllFieldsFragment } from '@/types/gqlTypes';

export const InactiveBanner = ({
  project,
}: {
  project: ProjectAllFieldsFragment;
}) => {
  if (!project.operatingEndDate) return null;
  const endDate = parseHmisDateString(project.operatingEndDate);
  return endDate && isBefore(endDate, addDays(new Date(), -1)) ? (
    <Alert severity='info' sx={{ mb: 2 }}>
      This project is inactive
    </Alert>
  ) : null;
};

const Project = () => {
  const { projectId } = useParams() as {
    projectId: string;
  };

  const [crumbs, loading, project] = useProjectCrumbs();
  if (loading) return <Loading />;
  console.log();
  if (!crumbs || !project) throw Error('Project not found');

  return (
    <ProjectLayout>
      <Breadcrumbs crumbs={crumbs} />
      <Typography variant='h3' sx={{ mb: 4 }}>
        {project.projectName}
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={9}>
          <InactiveBanner project={project} />
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant='h6' sx={{ mb: 2 }}>
              Project Details
            </Typography>
            <ProjectDetails project={project} />
          </Paper>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant='h5' sx={{ mb: 2 }}>
              Funding Sources
            </Typography>
            <FunderTable projectId={projectId} />
          </Paper>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant='h5' sx={{ mb: 2 }}>
              Project CoCs
            </Typography>
            <ProjectCocTable projectId={projectId} />
          </Paper>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant='h5' sx={{ mb: 2 }}>
              Inventory
            </Typography>
            <InventoryTable projectId={projectId} />
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
                to={generatePath(Routes.NEW_INVENTORY, { projectId })}
              >
                + Add Inventory
              </ButtonLink>
              <ButtonLink
                variant='outlined'
                color='secondary'
                sx={{ pl: 3, justifyContent: 'left' }}
                to={generatePath(Routes.NEW_FUNDER, { projectId })}
              >
                + Add Funding Source
              </ButtonLink>
              <ButtonLink
                variant='outlined'
                color='secondary'
                sx={{ pl: 3, justifyContent: 'left' }}
                to={generatePath(Routes.NEW_COC, { projectId })}
              >
                + Add Project CoC
              </ButtonLink>
            </Stack>
          </Paper>
          {project.contactInformation && (
            <Paper sx={{ p: 2, mb: 3 }}>
              <Stack spacing={2}>
                <Typography variant='h5'>Project Contact</Typography>
                <MultilineTypography variant='body2'>
                  {project.contactInformation}
                </MultilineTypography>
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
              {/* TODO implement delete */}
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
