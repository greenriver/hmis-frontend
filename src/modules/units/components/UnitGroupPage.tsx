import AddIcon from '@mui/icons-material/Add';
import { Button, Grid, Paper, Stack } from '@mui/material';

import { useEffect, useState } from 'react';
import UnitManagementTable from './UnitManagementTable';

import Loading from '@/components/elements/Loading';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import UnitGroupCeConfigurationCard from '@/modules/ce/components/unitGroup/UnitGroupCeConfigurationCard';
import UnitGroupDefaultContactsCard from '@/modules/ce/components/unitGroup/UnitGroupDefaultContactsCard';
import UnitGroupEligibilityCard from '@/modules/ce/components/unitGroup/UnitGroupEligibilityCard';
import { useHasRootPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import CreateUnitsDialog from '@/modules/units/components/CreateUnitsDialog';
import UnitGroupCard from '@/modules/units/components/UnitGroupCard';
import { ProjectDashboardRoutes } from '@/routes/routes';
import { useGetUnitGroupQuery } from '@/types/gqlTypes';

// Page for viewing/managing a single unit group, and the units within it
const UnitGroupPage = () => {
  const { project, overrideBreadcrumbTitles } = useProjectDashboardContext();
  const { unitGroupId } = useSafeParams() as { unitGroupId: string };
  const {
    data: { unitGroup } = {},
    loading,
    error,
  } = useGetUnitGroupQuery({
    variables: { id: unitGroupId },
  });
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const [canViewCoordinatedEntry] = useHasRootPermissions([
    'canViewCoordinatedEntry',
  ]);

  // Set the breadcrumb so it says the correct name of this unit group
  useEffect(() => {
    if (!unitGroup) return;
    overrideBreadcrumbTitles({
      [ProjectDashboardRoutes.UNIT_GROUP]: unitGroup.name,
    });
  }, [overrideBreadcrumbTitles, unitGroup]);

  if (loading) return <Loading />;
  if (error) throw error;
  if (!unitGroup) return <NotFound />;
  const canEditUnitGroup = project.access.canManageUnits;

  return (
    <>
      <PageTitle
        overlineText={
          canEditUnitGroup ? 'Manage Unit Group' : 'View Unit Group'
        }
        title={unitGroup.name}
        actions={
          canEditUnitGroup && (
            <Button
              onClick={() => setDialogOpen(true)}
              startIcon={<AddIcon />}
              variant='outlined'
            >
              Add Units
            </Button>
          )
        }
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {canViewCoordinatedEntry && (
          <Grid item xs={4}>
            <Stack gap={2}>
              <UnitGroupCeConfigurationCard unitGroup={unitGroup} />
              <UnitGroupDefaultContactsCard
                unitGroup={unitGroup}
                canEdit={canEditUnitGroup}
              />
              <UnitGroupEligibilityCard
                unitGroup={unitGroup}
                canEdit={canEditUnitGroup}
              />
            </Stack>
          </Grid>
        )}
        <Grid item xs={canViewCoordinatedEntry ? 8 : 12}>
          <Stack gap={2}>
            <UnitGroupCard unitGroup={unitGroup} />
            {!!unitGroup.capacity && (
              <Paper>
                <UnitManagementTable
                  projectId={project.id}
                  unitGroupId={unitGroupId}
                  ceEnabled={canViewCoordinatedEntry}
                />
              </Paper>
            )}
          </Stack>
        </Grid>
      </Grid>

      <CreateUnitsDialog
        projectId={project.id}
        unitGroupId={unitGroupId}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
};
export default UnitGroupPage;
