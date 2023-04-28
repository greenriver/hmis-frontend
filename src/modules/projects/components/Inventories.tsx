import AddIcon from '@mui/icons-material/Add';
import { Paper } from '@mui/material';

import InventoryTable from './tables/InventoryTable';

import ButtonLink from '@/components/elements/ButtonLink';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import { ProjectPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { ProjectDashboardRoutes } from '@/routes/routes';
import generateSafePath from '@/utils/generateSafePath';

const Inventories = () => {
  const { projectId } = useSafeParams() as {
    projectId: string;
  };

  return (
    <>
      <PageTitle
        title='Inventory Records'
        actions={
          <ProjectPermissionsFilter
            id={projectId}
            permissions='canEditProjectDetails'
          >
            <ButtonLink
              data-testid='addInventoryButton'
              to={generateSafePath(ProjectDashboardRoutes.NEW_INVENTORY, {
                projectId,
              })}
              Icon={AddIcon}
            >
              Add Inventory
            </ButtonLink>
          </ProjectPermissionsFilter>
        }
      />
      <Paper>
        <InventoryTable projectId={projectId} />
      </Paper>
    </>
  );
};
export default Inventories;
