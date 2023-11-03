import EditIcon from '@mui/icons-material/Edit';
import { Alert, Chip, Stack, Tooltip, Typography } from '@mui/material';
import { addDays, isBefore } from 'date-fns';
import { ReactNode } from 'react';

import { useProjectDashboardContext } from './ProjectDashboard';

import ButtonLink from '@/components/elements/ButtonLink';
import PageTitle from '@/components/layout/PageTitle';
import ViewRecord from '@/modules/form/components/ViewRecord';
import {
  parseAndFormatDateRange,
  parseHmisDateString,
} from '@/modules/hmis/hmisUtil';
import { ProjectPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { ProjectDashboardRoutes } from '@/routes/routes';
import { FormRole, ProjectAllFieldsFragment } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

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
  const { project } = useProjectDashboardContext();
  return (
    <>
      <PageTitle
        title={project.projectName}
        actions={
          <ProjectPermissionsFilter
            id={project.id}
            permissions={'canEditProjectDetails'}
          >
            <ButtonLink
              data-testid='updateProjectButton'
              to={generateSafePath(ProjectDashboardRoutes.EDIT_PROJECT, {
                projectId: project.id,
              })}
              sx={{ justifyContent: 'left' }}
              startIcon={<EditIcon />}
            >
              Edit Project Details
            </ButtonLink>
          </ProjectPermissionsFilter>
        }
      />
      <InactiveBanner project={project} />
      <ViewRecord record={project} formRole={FormRole.Project} />
    </>
  );
};
export default ProjectOverview;
