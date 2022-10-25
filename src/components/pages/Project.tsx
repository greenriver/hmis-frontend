import { Alert, Button, Grid, Paper, Stack, Typography } from '@mui/material';
import { addDays, isBefore } from 'date-fns';
import { useState } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router-dom';

import Breadcrumbs from '../elements/Breadcrumbs';
import ButtonLink from '../elements/ButtonLink';
import ConfirmationDialog from '../elements/ConfirmDialog';
import Loading from '../elements/Loading';
import MultilineTypography from '../elements/MultilineTypography';

import { parseHmisDateString } from '@/modules/hmis/hmisUtil';
import FunderTable from '@/modules/inventory/components/FunderTable';
import InventoryTable from '@/modules/inventory/components/InventoryTable';
import ProjectCocTable from '@/modules/inventory/components/ProjectCocTable';
import ProjectDetails from '@/modules/inventory/components/ProjectDetails';
import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
import { useProjectCrumbs } from '@/modules/inventory/components/useProjectCrumbs';
import { Routes } from '@/routes/routes';
import {
  ProjectAllFieldsFragment,
  useDeleteProjectMutation,
} from '@/types/gqlTypes';

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
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [crumbs, loading, project] = useProjectCrumbs();

  const [deleteProject, { loading: deleteLoading, error: deleteError }] =
    useDeleteProjectMutation({
      variables: { input: { id: projectId } },
      onCompleted: () =>
        project
          ? navigate(
              generatePath(Routes.ORGANIZATION, {
                organizationId: project?.organization.id,
              })
            )
          : navigate(-1),
    });

  if (loading) return <Loading />;
  if (deleteError) console.error(deleteError);
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
              <ButtonLink
                variant='outlined'
                color='secondary'
                sx={{ pl: 3, justifyContent: 'left' }}
                to={generatePath(Routes.NEW_INVENTORY, { projectId })}
              >
                + Add Inventory
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
            <Stack>
              <ButtonLink
                variant='text'
                color='secondary'
                to={generatePath(Routes.EDIT_PROJECT, {
                  projectId,
                })}
                sx={{ justifyContent: 'left' }}
              >
                Edit Project
              </ButtonLink>
              <Button
                color='error'
                variant='text'
                onClick={() => setOpen(true)}
                sx={{ justifyContent: 'left' }}
              >
                Delete Project
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
      <ConfirmationDialog
        id='deleteProjectConfirmation'
        open={open}
        title='Delete project'
        onConfirm={deleteProject}
        onCancel={() => setOpen(false)}
        loading={deleteLoading}
      >
        <Typography>
          Are you sure you want to delete project{' '}
          <strong>{project.projectName}</strong>?
        </Typography>
        <Typography>This action cannot be undone.</Typography>
      </ConfirmationDialog>
    </ProjectLayout>
  );
};
export default Project;
