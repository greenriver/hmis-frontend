import AddIcon from '@mui/icons-material/Add';
import { Button, Grid, Paper, Stack, Typography } from '@mui/material';

import { useEffect, useState } from 'react';
import UnitManagementTable from './UnitManagementTable';

import CommonCard from '@/components/elements/CommonCard';
import Loading from '@/components/elements/Loading';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import { useHasRootPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import CreateUnitsDialog from '@/modules/units/components/CreateUnitsDialog';
import UnitGroupCard from '@/modules/units/components/UnitGroupCard';
import UnitGroupEligibilityCard from '@/modules/units/components/UnitGroupEligibilityCard';
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
  const canEdit = project.access.canManageUnits;

  return (
    <>
      <PageTitle
        overlineText={canEdit ? 'Manage Unit Group' : 'View Unit Group'}
        title={unitGroup.name}
        actions={
          canEdit && (
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
              <CommonCard title='Configuration'>
                <Typography>
                  <b>Workflow Template:</b>{' '}
                  {unitGroup.workflowTemplateName || 'None'}
                </Typography>
              </CommonCard>
              {/* TODO(#7538) */}
              <CommonCard title='Default Contacts'>
                Assign Default Contacts
              </CommonCard>
              <UnitGroupEligibilityCard
                unitGroup={unitGroup}
                canEdit={canEdit}
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
                  allowDeleteUnits={project.access.canManageUnits}
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
