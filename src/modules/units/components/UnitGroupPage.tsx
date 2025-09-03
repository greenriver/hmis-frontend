import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { Button, Grid, Paper, Stack, Typography } from '@mui/material';

import { useEffect, useState } from 'react';
import UnitManagementTable from './UnitManagementTable';

import Loading from '@/components/elements/Loading';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import MatchRuleCard from '@/modules/ce/components/unit/MatchRuleCard';
import UnitGroupCeConfigurationCard from '@/modules/ce/components/unitGroup/UnitGroupCeConfigurationCard';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import CreateUnitsDialog from '@/modules/units/components/CreateUnitsDialog';
import UnitGroupFormDialog from '@/modules/units/components/UnitGroupFormDialog';
import UnitUtilizationByUnitType from '@/modules/units/components/UnitUtilizationByUnitType';
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
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);

  const {
    supportsReferrals: projectSupportsReferrals,
    supportsWaitlistReferrals: projectSupportsWaitlistReferrals,
  } = project.coordinatedEntryFeatures || {};

  // Set the breadcrumb so it says the correct name of this unit group
  useEffect(() => {
    if (!unitGroup) return;
    overrideBreadcrumbTitles({
      [ProjectDashboardRoutes.UNIT_GROUP]: unitGroup.name,
    });
  }, [overrideBreadcrumbTitles, unitGroup]);

  if (loading && !unitGroup) return <Loading />;
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
            <Stack direction='row' gap={1}>
              <Button
                onClick={() => setEditDialogOpen(true)}
                startIcon={<EditIcon />}
                variant='outlined'
              >
                Edit Unit Group
              </Button>
              <Button
                onClick={() => setDialogOpen(true)}
                startIcon={<AddIcon />}
                variant='outlined'
              >
                Add Units
              </Button>
            </Stack>
          )
        }
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={projectSupportsReferrals ? 8 : 12}>
          {!!unitGroup.capacity ? (
            <Stack gap={2}>
              <Paper sx={{ py: 3, px: 2 }}>
                <UnitUtilizationByUnitType unitTypes={unitGroup.unitTypes} />
              </Paper>
              <Paper>
                <UnitManagementTable
                  projectId={project.id}
                  unitGroupId={unitGroupId}
                  coordinatedEntryFeatures={
                    project.coordinatedEntryFeatures || {}
                  }
                />
              </Paper>
            </Stack>
          ) : (
            <Paper sx={{ p: 2 }}>
              <Typography color='text.secondary'>No units.</Typography>
            </Paper>
          )}
        </Grid>
        {projectSupportsReferrals && (
          <Grid item xs={4}>
            <Stack gap={2}>
              <UnitGroupCeConfigurationCard unitGroup={unitGroup} />
              {/* TODO(#7538) - support setting default contacts */}
              {/* <UnitGroupDefaultContactsCard
                unitGroup={unitGroup}
                canEdit={canEditUnitGroup}
              /> */}

              {/* TODO(#7544) - support configuring eligibility rules */}
              {/* <UnitGroupEligibilityCard
                unitGroup={unitGroup}
                canEdit={canEditUnitGroup}
              /> */}

              {projectSupportsWaitlistReferrals && (
                <>
                  <MatchRuleCard
                    title='Eligibility Requirements'
                    rules={unitGroup.eligibilityRequirements || []}
                  />
                  <MatchRuleCard
                    title='Prioritization'
                    rules={unitGroup.prioritySchemes || []}
                  />
                </>
              )}
            </Stack>
          </Grid>
        )}
      </Grid>

      <CreateUnitsDialog
        projectId={project.id}
        unitGroupId={unitGroupId}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        includeCeFields={projectSupportsReferrals}
        // If adding first units to group, allow user to select unit type. After that, don't allow unit type selection and let the backend infer it.
        allowSelectUnitType={unitGroup.capacity === 0}
        allowSelectUnitGroup={false}
      />
      <UnitGroupFormDialog
        projectId={project.id}
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        projectSupportsReferrals={projectSupportsReferrals}
        unitGroup={unitGroup}
      />
    </>
  );
};
export default UnitGroupPage;
