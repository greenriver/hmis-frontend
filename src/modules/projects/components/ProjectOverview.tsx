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
import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useProjectDashboardContext } from './ProjectDashboard';
import ProjectEnrollmentsTable from './tables/ProjectEnrollmentsTable';

import ButtonLink from '@/components/elements/ButtonLink';
import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import MultilineTypography from '@/components/elements/MultilineTypography';
import TitleCard from '@/components/elements/TitleCard';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import IdDisplay from '@/modules/hmis/components/IdDisplay';
import {
  parseAndFormatDateRange,
  parseHmisDateString,
} from '@/modules/hmis/hmisUtil';
import { ProjectPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import ProjectDetails from '@/modules/projects/components/ProjectDetails';
import { cache } from '@/providers/apolloClient';
import { ProjectDashboardRoutes, Routes } from '@/routes/routes';
import {
  PickListType,
  ProjectAllFieldsFragment,
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

export const ProjectFormTitle = ({
  title,
  project,
  actions,
}: {
  title: string;
  project: ProjectAllFieldsFragment;
  actions?: ReactNode;
}) => (
  <Stack
    direction={'row'}
    justifyContent='space-between'
    alignItems={'end'}
    spacing={2}
    sx={{ my: 1 }}
  >
    <Stack direction={'row'} spacing={2}>
      <Typography variant='h3' sx={{ pt: 0, mt: 0 }}>
        {title}
      </Typography>
      <InactiveChip project={project} />
    </Stack>
    {actions}
  </Stack>
);

const ProjectOverview = () => {
  const { projectId } = useSafeParams() as {
    projectId: string;
  };
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { project } = useProjectDashboardContext();

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

  if (deleteError) console.error(deleteError);

  return (
    <>
      <PageTitle title={project.projectName} />
      <Grid container spacing={4}>
        <Grid item xs={8}>
          <InactiveBanner project={project} />
          <Paper sx={{ p: 2, mb: 2 }} data-testid='projectDetailsCard'>
            <Stack
              justifyContent={'space-between'}
              direction='row'
              sx={{ mb: 2 }}
            >
              <Typography variant='h5'>Project Details</Typography>
            </Stack>
            <ProjectDetails project={project} />
          </Paper>
          <ProjectPermissionsFilter
            id={project.id}
            permissions='canViewEnrollmentDetails'
          >
            <TitleCard data-testid='clientsCard' title='Enrollments'>
              <ProjectEnrollmentsTable projectId={projectId} />
            </TitleCard>
          </ProjectPermissionsFilter>
        </Grid>
        <Grid item xs={4}>
          <ProjectPermissionsFilter
            id={project.id}
            permissions='canEditEnrollments'
          >
            <Paper sx={{ p: 2, mb: 3 }}>
              <Stack spacing={2}>
                <Typography variant='h6'>Client Related Actions</Typography>
                <ButtonLink
                  data-testid='recordServicesButton'
                  variant='outlined'
                  color='secondary'
                  sx={{ pl: 3, justifyContent: 'left' }}
                  to={generateSafePath(ProjectDashboardRoutes.ADD_SERVICES, {
                    projectId,
                  })}
                >
                  Record Services
                </ButtonLink>
              </Stack>
            </Paper>
          </ProjectPermissionsFilter>
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
          <ProjectPermissionsFilter
            id={project.id}
            permissions={['canDeleteProject', 'canEditProjectDetails']}
          >
            <Paper sx={{ p: 2, mb: 2 }}>
              <Stack>
                <ProjectPermissionsFilter
                  id={project.id}
                  permissions={'canEditProjectDetails'}
                >
                  <ButtonLink
                    data-testid='updateProjectButton'
                    variant='text'
                    color='secondary'
                    to={generateSafePath(ProjectDashboardRoutes.EDIT_PROJECT, {
                      projectId,
                    })}
                    sx={{ justifyContent: 'left' }}
                  >
                    Edit Project
                  </ButtonLink>
                </ProjectPermissionsFilter>
                <ProjectPermissionsFilter
                  id={project.id}
                  permissions={'canDeleteProject'}
                >
                  <Button
                    data-testid='deleteProjectButton'
                    color='error'
                    variant='text'
                    onClick={() => setOpen(true)}
                    sx={{ justifyContent: 'left' }}
                  >
                    Delete Project
                  </Button>
                </ProjectPermissionsFilter>
              </Stack>
            </Paper>
          </ProjectPermissionsFilter>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Stack gap={0.5}>
              <IdDisplay
                prefix='HMIS'
                color='text.secondary'
                value={project.id}
              />
              <IdDisplay
                prefix='Project'
                color='text.secondary'
                value={project.hudId}
              />
            </Stack>
          </Paper>
        </Grid>
      </Grid>
      <ProjectPermissionsFilter
        id={project.id}
        permissions={'canDeleteProject'}
      >
        <ConfirmationDialog
          id='deleteProjectConfirmation'
          open={open}
          title='Delete project'
          onConfirm={() => deleteProject()}
          onCancel={() => setOpen(false)}
          loading={deleteLoading}
        >
          <Typography>
            Are you sure you want to delete project{' '}
            <strong>{project.projectName}</strong>?
          </Typography>
          <Typography>This action cannot be undone.</Typography>
        </ConfirmationDialog>
      </ProjectPermissionsFilter>
    </>
  );
};
export default ProjectOverview;
