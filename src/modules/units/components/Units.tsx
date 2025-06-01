import AddIcon from '@mui/icons-material/Add';
import { Button, Grid, Paper, Stack } from '@mui/material';
import { useMemo, useState } from 'react';

import Loading from '@/components/elements/Loading';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import { ProjectPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import ProjectUnitsTable from '@/modules/units/components/ProjectUnitsTable';
import UnitGroupCard from '@/modules/units/components/UnitGroupCard';
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
          <Grid
            container
            rowSpacing={{ xs: 1, sm: 2, md: 3 }}
            columnSpacing={{ xs: 1, sm: 2, md: 3 }}
          >
            {unitGroups.map((group) => (
              <Grid
                item
                xs={12}
                md={unitGroups.length > 1 ? 6 : 12}
                key={group.id}
              >
                <UnitGroupCard
                  unitGroup={group}
                  menuItems={[
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
                  ]}
                />
              </Grid>
            ))}
          </Grid>
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
