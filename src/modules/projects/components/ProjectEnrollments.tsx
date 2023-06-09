import { Paper, Stack } from '@mui/material';

import ProjectEnrollmentsTable from './tables/ProjectEnrollmentsTable';

import ButtonLink from '@/components/elements/ButtonLink';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import { ProjectPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { ProjectDashboardRoutes } from '@/routes/routes';
import generateSafePath from '@/utils/generateSafePath';

const ProjectEnrollments = () => {
  const { projectId } = useSafeParams() as {
    projectId: string;
  };

  return (
    <>
      <PageTitle
        title='Enrollments'
        // TODO: action button to add enrollment
        actions={
          <ProjectPermissionsFilter
            id={projectId}
            permissions='canEditEnrollments'
          >
            <Stack direction='row' gap={2}>
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
              <ButtonLink
                data-testid='addHouseholdButton'
                variant='outlined'
                color='secondary'
                sx={{ pl: 3, justifyContent: 'left' }}
                to={generateSafePath(ProjectDashboardRoutes.ADD_HOUSEHOLD, {
                  projectId,
                })}
              >
                Add Household
              </ButtonLink>
            </Stack>
          </ProjectPermissionsFilter>
        }
      />
      <Paper>
        <ProjectEnrollmentsTable projectId={projectId} />
      </Paper>
    </>
  );
};
export default ProjectEnrollments;
