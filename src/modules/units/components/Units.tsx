import AddIcon from '@mui/icons-material/Add';
import { Masonry } from '@mui/lab';
import { Button, Paper, Stack } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';

import CommonCard from '@/components/elements/CommonCard';
import Loading from '@/components/elements/Loading';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import { ProjectPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import ProjectUnitsTable from '@/modules/units/components/ProjectUnitsTable';
import UnitCapacityTable from '@/modules/units/components/UnitCapacityTable';
import UnitGroupCard from '@/modules/units/components/UnitGroupCard';
import UnitGroupFormDialog from '@/modules/units/components/UnitGroupFormDialog';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  UnitGroupFieldsFragment,
  useGetProjectUnitGroupsQuery,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const Units = () => {
  const { project } = useProjectDashboardContext();

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const { data, error, loading } = useGetProjectUnitGroupsQuery({
    variables: { id: project.id, limit: 100 },
  });

  const unitGroups = useMemo(() => {
    if (!data?.project?.unitGroups) return [];
    return data.project.unitGroups.nodes;
  }, [data]);

  const unitGroupMenuItems = useCallback(
    (group: UnitGroupFieldsFragment) => {
      return [
        {
          key: 'manage',
          title: project.access.canManageUnits
            ? 'Manage Unit Group'
            : 'View Unit Group',
          to: generateSafePath(ProjectDashboardRoutes.UNIT_GROUP, {
            projectId: project.id,
            unitGroupId: group.id,
          }),
        },
      ];
    },
    [project.access.canManageUnits, project.id]
  );

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
          <Masonry
            columns={{ xs: 1, md: unitGroups.length === 1 ? 1 : 2 }}
            spacing={2}
            sx={{ width: 'auto' }}
          >
            {unitGroups.map((group) => (
              <UnitGroupCard
                key={group.id}
                unitGroup={group}
                menuItems={unitGroupMenuItems(group)}
              />
            ))}
          </Masonry>
        )}
        {/* keep legacy behavior: if units exist outside of groups, show utilization charts grouped by unit type */}
        {unitGroups.length === 0 && (
          <CommonCard title='Capacity'>
            <UnitCapacityTable projectId={project.id} />
          </CommonCard>
        )}
        <Paper>
          <ProjectUnitsTable projectId={project.id} />
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
