import { Paper } from '@mui/material';

import ProjectEnrollmentsTable from './tables/ProjectEnrollmentsTable';

import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';

const ProjectEnrollments = () => {
  const { projectId } = useSafeParams() as {
    projectId: string;
  };

  return (
    <>
      <PageTitle
        title='Enrollments'
        // TODO: action button to add enrollment
      />
      <Paper>
        <ProjectEnrollmentsTable projectId={projectId} />
      </Paper>
    </>
  );
};
export default ProjectEnrollments;
