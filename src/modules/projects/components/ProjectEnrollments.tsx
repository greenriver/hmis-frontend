import AddIcon from '@mui/icons-material/Add';
import { Paper, Stack } from '@mui/material';

import ProjectEnrollmentsTable from './tables/ProjectEnrollmentsTable';

import ButtonLink from '@/components/elements/ButtonLink';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import { ProjectPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { ProjectDashboardRoutes } from '@/routes/routes';
import { generateSafePath } from '@/utils/pathEncoding';

const ProjectEnrollments = () => {
  const { projectId } = useSafeParams() as {
    projectId: string;
  };

  return (
    <>
      <PageTitle
        title='Enrollments'
        actions={
          <ProjectPermissionsFilter
            id={projectId}
            permissions='canEditEnrollments'
          >
            <Stack direction='row' gap={2}>
              <ProjectPermissionsFilter
                id={projectId}
                permissions='canEnrollClients'
              >
                <ButtonLink
                  data-testid='addHouseholdButton'
                  variant='outlined'
                  sx={{ pl: 3, justifyContent: 'left' }}
                  to={generateSafePath(ProjectDashboardRoutes.ADD_HOUSEHOLD, {
                    projectId,
                  })}
                  Icon={AddIcon}
                >
                  Add Enrollment
                </ButtonLink>
              </ProjectPermissionsFilter>
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
