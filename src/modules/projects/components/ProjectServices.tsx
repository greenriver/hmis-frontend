import { Paper } from '@mui/material';

import ProjectServicesTable from './tables/ProjectServicesTable';

import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';

const ProjectServices = () => {
  const { projectId } = useSafeParams() as {
    projectId: string;
  };

  return (
    <>
      <PageTitle title='Services' />
      <Paper>
        <ProjectServicesTable projectId={projectId} />
      </Paper>
    </>
  );
};
export default ProjectServices;
