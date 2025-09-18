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
    fetchPolicy: 'cache-and-network',
  });

  const projectSupportsReferrals = useMemo(
    () => project.coordinatedEntryFeatures?.supportsReferrals,
    [project.coordinatedEntryFeatures?.supportsReferrals]
  );

  const unitGroups = useMemo(() => {
    if (!data?.project?.unitGroups) return [];
    return data.project.unitGroups.nodes;
  }, [data]);

  // Enable Unit Groups management UI if:
  // - the project supports CE referrals (direct or waitlist), OR
  // - the project already has at least one unit group. (This will allow UI to switch over when Units are migrated into Unit Groups)
  // TODO(#7814) remove this flag once Unit Group migration is complete. At that point all projects will have Unit Groups Enabled.
  const unitGroupsEnabled = useMemo(
    () => !!projectSupportsReferrals || unitGroups.length > 0,
    [projectSupportsReferrals, unitGroups.length]
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
            {/* If this is a new project with NO unit groups, hide "Add Units" button and instead
            show "Add Unit Group" to add the initial group */}
            {unitGroupsEnabled && unitGroups.length === 0 ? (
              <Button
                onClick={() => setAddUnitGroupDialogOpen(true)}
                startIcon={<AddIcon />}
                variant='outlined'
              >
                Add Unit Group
              </Button>
            ) : (
              <Button
                onClick={() => setAddUnitsDialogOpen(true)}
                startIcon={<AddIcon />}
                variant='outlined'
              >
                Add Units
              </Button>
            )}
          </ProjectPermissionsFilter>
        }
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={unitGroups.length > 0 ? 8 : 12}>
          <Stack gap={4}>
            {project.hasUnits && (
              <CommonCard title='Capacity'>
                {/* This is split out by Unit Type, which should be the same as splitting out by Unit Group
                since Unit Groups each contain exactly 1 Unit Type. It would be better to show the Unit Group name here,
                but that requires reworking the graphql capacity type. */}
                <UnitCapacityTable projectId={project.id} />
              </CommonCard>
            )}
            <Paper>
              <UnitManagementTable
                projectId={project.id}
                unitGroupsEnabled={unitGroupsEnabled}
                projectSupportsReferrals={projectSupportsReferrals}
                noUnitsMessage={
                  unitGroupsEnabled && unitGroups.length === 0
                    ? 'No units. Add a unit group to get started.'
                    : undefined
                }
              />
            </Paper>
          </Stack>
        </Grid>
        {unitGroups.length > 0 && (
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
        allowSelectUnitType={!unitGroupsEnabled}
        allowSelectUnitGroup={unitGroupsEnabled}
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
