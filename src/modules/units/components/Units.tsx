import AddIcon from '@mui/icons-material/Add';
import { Button, Paper, Stack } from '@mui/material';
import { useMemo, useState } from 'react';

import CommonCard from '@/components/elements/CommonCard';
import Loading from '@/components/elements/Loading';
import RouterLink from '@/components/elements/RouterLink';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import { ProjectPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import AllUnitsTable from '@/modules/units/components/AllUnitsTable';
import UnitGroupFormDialog from '@/modules/units/components/UnitGroupFormDialog';
import { ProjectDashboardRoutes } from '@/routes/routes';
import { useGetUnitGroupsQuery } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const Units = () => {
  const { project } = useProjectDashboardContext();

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const { data, error, loading } = useGetUnitGroupsQuery({
    variables: { id: project.id, limit: 100 },
  });

  const unitGroups = useMemo(() => {
    if (!data?.project?.unitGroups) return [];
    return data.project.unitGroups.nodes;
  }, [data]);

  if (!project.access.canViewUnits) return <NotFound />;
  if (error) throw error;
  if (loading) return <Loading />;

  return (
    <>
      <PageTitle
        title='Units'
        actions={
          <ProjectPermissionsFilter
            id={project.id}
            permissions='canManageUnits'
          >
            <Button
              onClick={() => setDialogOpen(true)}
              startIcon={<AddIcon />}
              variant='outlined'
            >
              Add Unit Group
            </Button>
          </ProjectPermissionsFilter>
        }
      />
      <Stack gap={4}>
        {unitGroups.length > 0 && (
          <CommonCard title='Unit Groups'>
            {unitGroups.map((group) => (
              <div>
                <RouterLink
                  key={group.id}
                  to={generateSafePath(ProjectDashboardRoutes.UNIT_GROUP, {
                    projectId: project.id,
                    unitGroupId: group.id,
                  })}
                >
                  {group.name}
                </RouterLink>
              </div>
            ))}
          </CommonCard>
        )}
        {/* <TitleCard title='Capacity' headerSx={{ p: 2 }}>
          <UnitCapacityTable projectId={project.id} />
        </TitleCard> */}

        <Paper>
          <AllUnitsTable projectId={project.id} />
        </Paper>
      </Stack>
      <UnitGroupFormDialog
        projectId={project.id}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
};
export default Units;
