import AddIcon from '@mui/icons-material/Add';
import { Paper } from '@mui/material';

import { useProjectDashboardContext } from './ProjectDashboard';
import InventoryTable from './tables/InventoryTable';

import ButtonLink from '@/components/elements/ButtonLink';
import PageTitle from '@/components/layout/PageTitle';
import { ProjectPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { ProjectDashboardRoutes } from '@/routes/routes';
import generateSafePath from '@/utils/generateSafePath';

const Inventories = () => {
  const { project } = useProjectDashboardContext();

  return (
    <>
      <PageTitle
        title='Inventory Records'
        actions={
          <ProjectPermissionsFilter
            id={project.id}
            permissions='canEditProjectDetails'
          >
            <ButtonLink
              data-testid='addInventoryButton'
              to={generateSafePath(ProjectDashboardRoutes.NEW_INVENTORY, {
                projectId: project.id,
              })}
              Icon={AddIcon}
            >
              Add Inventory
            </ButtonLink>
          </ProjectPermissionsFilter>
        }
      />
      <Paper data-testid='inventoryCard'>
        <InventoryTable />
      </Paper>
    </>
  );
};
export default Inventories;
