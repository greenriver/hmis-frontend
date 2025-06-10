import AddIcon from '@mui/icons-material/Add';
import { Masonry } from '@mui/lab';
import { Button, Paper, Stack } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';

import CommonCard from '@/components/elements/CommonCard';
import Loading from '@/components/elements/Loading';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import { ProjectPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { useHasRootPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import CreateUnitsDialog from '@/modules/units/components/CreateUnitsDialog';
import ProjectUnitsTable from '@/modules/units/components/ProjectUnitsTable';
import UnitCapacityTable from '@/modules/units/components/UnitCapacityTable';
import UnitGroupCard from '@/modules/units/components/UnitGroupCard';
import UnitGroupFormDialog from '@/modules/units/components/UnitGroupFormDialog';
import UnitManagementTable from '@/modules/units/components/UnitManagementTable';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  UnitGroupFieldsFragment,
  useGetProjectUnitGroupsQuery,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

// This page has 2 "modes" based on whether the project has Coordinated Entry enabled.
//
// If CE is enabled, this page allows adding Unit Groups and linking to Unit Groups for Unit management.
// If CE is not enabled, this page retains the legacy behavior of managing Units directly without groups.
const Units = () => {
  const { project } = useProjectDashboardContext();

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const { data, error, loading } = useGetProjectUnitGroupsQuery({
    variables: { id: project.id, limit: 100 },
  });

  // Check CE feature flag. TODO replace with project config
  const [canViewCoordinatedEntry] = useHasRootPermissions([
    'canViewCoordinatedEntry',
  ]);

  // For now, we assume that if the project has Coordinated Entry enabled,
  // it also has Unit Groups enabled.
  const unitGroupsEnabled = useMemo(
    () => !!canViewCoordinatedEntry,
    [canViewCoordinatedEntry]
  );

  const unitGroups = useMemo(() => {
    if (!unitGroupsEnabled) return [];
    if (!data?.project?.unitGroups) return [];
    return data.project.unitGroups.nodes;
  }, [data, unitGroupsEnabled]);

  const unitGroupMenuItems = useCallback(
    (group: UnitGroupFieldsFragment) => {
      if (!unitGroupsEnabled) return [];

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
    [unitGroupsEnabled, project.access.canManageUnits, project.id]
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
            {unitGroupsEnabled ? (
              <Button
                onClick={() => setDialogOpen(true)}
                startIcon={<AddIcon />}
                variant='outlined'
              >
                Add Unit Group
              </Button>
            ) : (
              <Button
                onClick={() => setDialogOpen(true)} // FIXME!
                startIcon={<AddIcon />}
                variant='outlined'
              >
                Add Units
              </Button>
            )}
          </ProjectPermissionsFilter>
        }
      />
      <Stack gap={4}>
        {unitGroupsEnabled ? (
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
        ) : (
          <CommonCard title='Capacity'>
            <UnitCapacityTable projectId={project.id} />
          </CommonCard>
        )}
        <Paper>
          {unitGroupsEnabled ? (
            <ProjectUnitsTable
              projectId={project.id}
              unitGroupsEnabled={unitGroupsEnabled}
              ceEnabled={canViewCoordinatedEntry}
            />
          ) : (
            // If Unit Groups are not enabled, use the Unit Management Table so Units can be managed directly on this page
            <UnitManagementTable
              projectId={project.id}
              allowDeleteUnits={project.access.canManageUnits}
              ceEnabled={canViewCoordinatedEntry}
            />
          )}
        </Paper>
      </Stack>
      {unitGroupsEnabled ? (
        <UnitGroupFormDialog
          projectId={project.id}
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
        />
      ) : (
        <CreateUnitsDialog
          projectId={project.id}
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </>
  );
};
export default Units;
