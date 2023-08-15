import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import { Paper, Stack } from '@mui/material';

import ProjectServicesTable from './tables/ProjectServicesTable';

import ButtonLink from '@/components/elements/ButtonLink';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import { ProjectPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { ProjectDashboardRoutes } from '@/routes/routes';
import generateSafePath from '@/utils/generateSafePath';

const ProjectServices = () => {
  const { projectId } = useSafeParams() as {
    projectId: string;
  };

  return (
    <>
      <PageTitle
        title='Services'
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
                Icon={LibraryAddIcon}
              >
                Record Services
              </ButtonLink>
            </Stack>
          </ProjectPermissionsFilter>
        }
      />
      <Paper>
        <ProjectServicesTable projectId={projectId} />
      </Paper>
    </>
  );
};
export default ProjectServices;
