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
      <Paper>
        <ProjectServicesTable projectId={projectId} />
      </Paper>
    </>
  );
};
export default ProjectServices;
