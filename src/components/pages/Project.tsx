import AddIcon from '@mui/icons-material/Add';
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
import TitleCard from '../elements/TitleCard';

import useSafeParams from '@/hooks/useSafeParams';
import IdDisplay from '@/modules/hmis/components/IdDisplay';
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
import {
  ProjectPermissionsFilter,
  RootPermissionsFilter,
} from '@/modules/permissions/PermissionsFilters';
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
            <Stack
              justifyContent={'space-between'}
              direction='row'
              sx={{ mb: 2 }}
            >
              <Typography variant='h5'>Project Details</Typography>
              <IdDisplay prefix='Project' id={project.id} />
            </Stack>
            <ProjectDetails project={project} />
          </Paper>
          <TitleCard data-testid='funderCard' title='Funding Sources'>
            <FunderTable projectId={projectId} />
          </TitleCard>
          <TitleCard data-testid='projectCocCard' title='Project CoCs'>
            <ProjectCocTable projectId={projectId} />
          </TitleCard>
          <TitleCard data-testid='inventoryCard' title='Inventory'>
            <InventoryTable
              projectId={projectId}
              es={project.projectType === ProjectType.Es}
            />
          </TitleCard>
          <RootPermissionsFilter permissions='canViewClients'>
            <TitleCard data-testid='clientsCard' title='Enrollments'>
              <ProjectEnrollmentsTable projectId={projectId} />
            </TitleCard>
          </RootPermissionsFilter>
        </Grid>
        <Grid item xs>
          <RootPermissionsFilter permissions='canEditEnrollments'>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Stack spacing={2}>
                <Typography variant='h6'>Client Related Actions</Typography>
                <ButtonLink
                  data-testid='recordServicesButton'
                  variant='outlined'
                  color='secondary'
                  sx={{ pl: 3, justifyContent: 'left' }}
                  to={generateSafePath(Routes.ADD_SERVICES, { projectId })}
                >
                  Record Services
                </ButtonLink>
              </Stack>
            </Paper>
          </RootPermissionsFilter>
          <ProjectPermissionsFilter
            id={projectId}
            permissions='canEditProjectDetails'
          >
            <Paper sx={{ p: 2, mb: 3 }}>
              <Stack spacing={2}>
                <Typography variant='h6'>Add to Project</Typography>
                <ButtonLink
                  data-testid='addFunderButton'
                  to={generateSafePath(Routes.NEW_FUNDER, { projectId })}
                  Icon={AddIcon}
                  leftAlign
                >
                  Add Funding Source
                </ButtonLink>
                <ButtonLink
                  data-testid='addProjectCocButton'
                  to={generateSafePath(Routes.NEW_COC, { projectId })}
                  Icon={AddIcon}
                  leftAlign
                >
                  Add Project CoC
                </ButtonLink>
                <ButtonLink
                  data-testid='addInventoryButton'
                  to={generateSafePath(Routes.NEW_INVENTORY, { projectId })}
                  Icon={AddIcon}
                  leftAlign
                >
                  Add Inventory
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
            <Paper sx={{ p: 2 }}>
              <Stack>
                <ProjectPermissionsFilter
                  id={project.id}
                  permissions={'canEditProjectDetails'}
                >
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
    </ProjectLayout>
  );
};
export default Project;
