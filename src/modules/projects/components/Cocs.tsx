import AddIcon from '@mui/icons-material/Add';
import { Paper } from '@mui/material';

import ProjectCocTable from './tables/ProjectCocTable';

import ButtonLink from '@/components/elements/ButtonLink';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import { ProjectPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { ProjectDashboardRoutes } from '@/routes/routes';
import generateSafePath from '@/utils/generateSafePath';
const Cocs = () => {
  const { projectId } = useSafeParams() as {
    projectId: string;
  };

  return (
    <>
      <PageTitle
        title='Project CoC Records'
        actions={
          <ProjectPermissionsFilter
            id={projectId}
            permissions='canEditProjectDetails'
          >
            <ButtonLink
              data-testid='addProjectCocButton'
              to={generateSafePath(ProjectDashboardRoutes.NEW_COC, {
                projectId,
              })}
              Icon={AddIcon}
            >
              Add CoC
            </ButtonLink>
          </ProjectPermissionsFilter>
        }
      />
      <Paper>
        <ProjectCocTable projectId={projectId} />
      </Paper>
    </>
  );
};
export default Cocs;
