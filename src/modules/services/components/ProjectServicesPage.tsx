import { Paper } from '@mui/material';

import ProjectServicesTable from './ProjectServicesTable';

import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';

const ProjectServicesPage = () => {
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
export default ProjectServicesPage;
