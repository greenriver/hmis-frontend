import {
  Alert,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { addDays, isBefore } from 'date-fns';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ButtonLink from '../elements/ButtonLink';
import ConfirmationDialog from '../elements/ConfirmDialog';
import Loading from '../elements/Loading';
import MultilineTypography from '../elements/MultilineTypography';

import useSafeParams from '@/hooks/useSafeParams';
import {
  parseAndFormatDateRange,
  parseHmisDateString,
} from '@/modules/hmis/hmisUtil';
import FunderTable from '@/modules/inventory/components/FunderTable';
import InventoryTable from '@/modules/inventory/components/InventoryTable';
import ProjectCocTable from '@/modules/inventory/components/ProjectCocTable';
import ProjectDetails from '@/modules/inventory/components/ProjectDetails';
import ProjectEnrollmentsTable from '@/modules/inventory/components/ProjectEnrollmentsTable';
import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
import { useProjectCrumbs } from '@/modules/inventory/components/useProjectCrumbs';
import { cache } from '@/providers/apolloClient';
import { Routes } from '@/routes/routes';
import {
  PickListType,
  ProjectAllFieldsFragment,
  ProjectType,
  useDeleteProjectMutation,
} from '@/types/gqlTypes';
import { evictPickList } from '@/utils/cacheUtil';
import generateSafePath from '@/utils/generateSafePath';

export const InactiveBanner = ({
  project,
}: {
  project: ProjectAllFieldsFragment;
}) => {
  if (!project.operatingEndDate) return null;
  const endDate = parseHmisDateString(project.operatingEndDate);
  if (!endDate || !isBefore(endDate, addDays(new Date(), -1))) return null;

  const dateRange = parseAndFormatDateRange(
    project.operatingStartDate,
    project.operatingEndDate
  );
  return (
    <Alert severity='info' sx={{ mb: 2 }}>
      This project is closed
      {dateRange && `. Project operated from ${dateRange}.`}
    </Alert>
  );
};

export const InactiveChip = ({
  project,
}: {
  project: ProjectAllFieldsFragment;
}) => {
  if (!project.operatingEndDate) return null;
  const endDate = parseHmisDateString(project.operatingEndDate);
  if (!endDate || !isBefore(endDate, addDays(new Date(), -1))) return null;

  const dateRange = parseAndFormatDateRange(
    project.operatingStartDate,
    project.operatingEndDate
  );
  return (
    <Tooltip
      title={
        <Typography variant='body2'>{`Project Operated from ${dateRange}`}</Typography>
      }
      placement='right'
      arrow
    >
      <Chip
        label='Closed Project'
        size='small'
        sx={{ mt: 1, alignSelf: 'flex-end' }}
      />
    </Tooltip>
  );
};

const Project = () => {
  const { projectId } = useSafeParams() as {
    projectId: string;
  };
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [crumbs, loading, project] = useProjectCrumbs();

  const [deleteProject, { loading: deleteLoading, error: deleteError }] =
    useDeleteProjectMutation({
      variables: { input: { id: projectId } },
      onCompleted: () => {
        if (project) {
          const organizationId = project.organization.id;
          cache.evict({
            id: `Organization:${organizationId}`,
            fieldName: 'projects',
          });
          evictPickList(PickListType.Project);
          navigate(
            generateSafePath(Routes.ORGANIZATION, {
              organizationId,
            })
          );
        } else {
          navigate(-1);
        }
      },
    });

  if (loading) return <Loading />;
  if (deleteError) console.error(deleteError);
  if (!crumbs || !project) throw Error('Project not found');

  return (
    <ProjectLayout crumbs={crumbs}>
      <Typography variant='h3' sx={{ mb: 4 }}>
        {project.projectName}
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={9}>
          <InactiveBanner project={project} />
          <Paper sx={{ p: 2, mb: 2 }} data-testid='projectDetailsCard'>
            <Typography variant='h5' sx={{ mb: 2 }}>
              Project Details
            </Typography>
            <ProjectDetails project={project} />
          </Paper>
          <Paper sx={{ p: 2, mb: 2 }} data-testid='funderCard'>
            <Typography variant='h5' sx={{ mb: 2 }}>
              Funding Sources
            </Typography>
            <FunderTable projectId={projectId} />
          </Paper>
          <Paper sx={{ p: 2, mb: 2 }} data-testid='projectCocCard'>
            <Typography variant='h5' sx={{ mb: 2 }}>
              Project CoCs
            </Typography>
            <ProjectCocTable projectId={projectId} />
          </Paper>
          <Paper sx={{ p: 2, mb: 2 }} data-testid='inventoryCard'>
            <Typography variant='h5' sx={{ mb: 2 }}>
              Inventory
            </Typography>
            <InventoryTable
              projectId={projectId}
              es={project.projectType === ProjectType.Es}
            />
          </Paper>
          <Paper sx={{ p: 2, mb: 2 }} data-testid='clientsCard'>
            <Typography variant='h5' sx={{ mb: 2 }}>
              Enrollments
            </Typography>
            <ProjectEnrollmentsTable projectId={projectId} />
          </Paper>
        </Grid>
        <Grid item xs>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Stack spacing={2}>
              <Typography variant='h6'>Add to Project</Typography>
              <ButtonLink
                data-testid='addFunderButton'
                variant='outlined'
                color='secondary'
                sx={{ pl: 3, justifyContent: 'left' }}
                to={generateSafePath(Routes.NEW_FUNDER, { projectId })}
              >
                + Add Funding Source
              </ButtonLink>
              <ButtonLink
                data-testid='addProjectCocButton'
                variant='outlined'
                color='secondary'
                sx={{ pl: 3, justifyContent: 'left' }}
                to={generateSafePath(Routes.NEW_COC, { projectId })}
              >
                + Add Project CoC
              </ButtonLink>
              <ButtonLink
                data-testid='addInventoryButton'
                variant='outlined'
                color='secondary'
                sx={{ pl: 3, justifyContent: 'left' }}
                to={generateSafePath(Routes.NEW_INVENTORY, { projectId })}
              >
                + Add Inventory
              </ButtonLink>
            </Stack>
          </Paper>
          {project.contactInformation && (
            <Paper sx={{ p: 2, mb: 3 }}>
              <Stack spacing={2}>
                <Typography variant='h6'>Project Contact</Typography>
                <MultilineTypography variant='body2'>
                  {project.contactInformation}
                </MultilineTypography>
              </Stack>
            </Paper>
          )}
          <Paper sx={{ p: 2 }}>
            <Stack>
              <ButtonLink
                data-testid='updateProjectButton'
                variant='text'
                color='secondary'
                to={generateSafePath(Routes.EDIT_PROJECT, {
                  projectId,
                })}
                sx={{ justifyContent: 'left' }}
              >
                Edit Project
              </ButtonLink>
              <Button
                data-testid='deleteProjectButton'
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
