import AddIcon from '@mui/icons-material/Add';
import { Paper } from '@mui/material';

import { useProjectDashboardContext } from './ProjectDashboard';
import ProjectCocTable from './tables/ProjectCocTable';

import ButtonLink from '@/components/elements/ButtonLink';
import PageTitle from '@/components/layout/PageTitle';
import { ProjectDashboardRoutes } from '@/routes/routes';
import { generateSafePath } from '@/utils/pathEncoding';
const Cocs = () => {
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
export default Cocs;
