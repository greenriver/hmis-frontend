import AddIcon from '@mui/icons-material/Add';
import { Button, Grid, Paper, Stack } from '@mui/material';
import { useMemo, useState } from 'react';

import CommonCard from '@/components/elements/CommonCard';
import Loading from '@/components/elements/Loading';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import { ProjectPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import CreateUnitsDialog from '@/modules/units/components/CreateUnitsDialog';
import UnitCapacityTable from '@/modules/units/components/UnitCapacityTable';
import UnitGroupCard from '@/modules/units/components/UnitGroupCard';
import UnitGroupFormDialog from '@/modules/units/components/UnitGroupFormDialog';
import UnitManagementTable from '@/modules/units/components/UnitManagementTable';
import { useGetProjectUnitGroupsQuery } from '@/types/gqlTypes';

// This page has 2 "modes" based on whether the project supports Coordinated Entry referrals.
//
// If yes, this page allows adding Unit Groups and linking to Unit Groups for Unit management.
// If no, this page retains the legacy behavior of managing Units directly without groups.
const Units = () => {
  const { project } = useProjectDashboardContext();

  const [addUnitsDialogOpen, setAddUnitsDialogOpen] = useState<boolean>(false);
  const [addUnitGroupDialogOpen, setAddUnitGroupDialogOpen] =
    useState<boolean>(false);

  const { data, error, loading } = useGetProjectUnitGroupsQuery({
    variables: { id: project.id, limit: 100 },
  });

  const projectSupportsReferrals = useMemo(
    () => project.coordinatedEntryFeatures?.supportsReferrals,
    [project.coordinatedEntryFeatures?.supportsReferrals]
  );

  // For now, we assume that if the project supports CE referrals, it also has Unit Groups enabled.
  // TODO(#7814) update this- for now maybe I expand this to include if unit groups exists in the project at all?
  const unitGroupsEnabled = useMemo(
    () => !!projectSupportsReferrals,
    [projectSupportsReferrals]
  );

  const unitGroups = useMemo(() => {
    if (!unitGroupsEnabled) return [];
    if (!data?.project?.unitGroups) return [];
    return data.project.unitGroups.nodes;
  }, [data, unitGroupsEnabled]);

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
            {/* FIXME: should be hidden if unitGroupsEnabled and there are no unit groups yet, because you need to create one first */}
            <Button
              onClick={() => setAddUnitsDialogOpen(true)}
              startIcon={<AddIcon />}
              variant='outlined'
            >
              Add Units
            </Button>
          </ProjectPermissionsFilter>
        }
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={unitGroupsEnabled ? 8 : 12}>
          <Stack gap={4}>
            {unitGroupsEnabled ? (
              <CommonCard title='Capacity'>total capacity: x</CommonCard>
            ) : (
              <CommonCard title='Capacity'>
                <UnitCapacityTable projectId={project.id} />
              </CommonCard>
            )}

            <Paper>
              <UnitManagementTable
                projectId={project.id}
                unitGroupsEnabled={unitGroupsEnabled}
                projectSupportsReferrals={projectSupportsReferrals}
              />
            </Paper>
          </Stack>
        </Grid>
        {projectSupportsReferrals && (
          <Grid item xs={4}>
            <Stack gap={2}>
              {unitGroups.map((group) => (
                <UnitGroupCard
                  key={group.id}
                  unitGroup={group}
                  projectId={project.id}
                  linkToUnitGroup
                />
              ))}
              <ProjectPermissionsFilter
                id={project.id}
                permissions='canManageUnits'
              >
                <Button
                  onClick={() => setAddUnitGroupDialogOpen(true)}
                  startIcon={<AddIcon />}
                  color='grayscale'
                  variant='outlined'
                >
                  Add Unit Group
                </Button>
              </ProjectPermissionsFilter>
            </Stack>
          </Grid>
        )}
      </Grid>
      <CreateUnitsDialog
        projectId={project.id}
        open={addUnitsDialogOpen}
        onClose={() => setAddUnitsDialogOpen(false)}
        includeCeFields={projectSupportsReferrals}
        unitGroups={unitGroups}
      />
      <UnitGroupFormDialog
        projectId={project.id}
        open={addUnitGroupDialogOpen}
        onClose={() => setAddUnitGroupDialogOpen(false)}
        projectSupportsReferrals={projectSupportsReferrals}
      />
    </>
  );
};
export default Units;
