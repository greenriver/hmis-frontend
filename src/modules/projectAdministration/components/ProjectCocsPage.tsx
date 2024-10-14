import AddIcon from '@mui/icons-material/Add';
import { Paper } from '@mui/material';

import { useProjectDashboardContext } from '../../projects/components/ProjectDashboard';
import ProjectCocTable from './ProjectCocTable';

import ButtonLink from '@/components/elements/ButtonLink';
import PageTitle from '@/components/layout/PageTitle';
import { ProjectDashboardRoutes } from '@/routes/routes';
import { generateSafePath } from '@/utils/pathEncoding';

const ProjectCocsPage = () => {
  const { project } = useProjectDashboardContext();

  return (
    <>
      <PageTitle
        title='Project CoC Records'
        actions={
          project.access.canEditProjectDetails ? (
            <ButtonLink
              data-testid='addProjectCocButton'
              to={generateSafePath(ProjectDashboardRoutes.NEW_COC, {
                projectId: project.id,
              })}
              Icon={AddIcon}
            >
              Add CoC
            </ButtonLink>
          ) : undefined
        }
      />
      <Paper data-testid='projectCocCard'>
        <ProjectCocTable />
      </Paper>
    </>
  );
};
export default ProjectCocsPage;
