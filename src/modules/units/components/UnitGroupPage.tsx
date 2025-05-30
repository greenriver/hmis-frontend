import AddIcon from '@mui/icons-material/Add';
import { Button, Paper, Stack } from '@mui/material';

import { useState } from 'react';
import UnitCapacityTable from './UnitCapacityTable';
import UnitManagementTable from './UnitManagementTable';

import CommonCard from '@/components/elements/CommonCard';
import Loading from '@/components/elements/Loading';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import CreateUnitsDialog from '@/modules/units/components/CreateUnitsDialog';
import { useGetUnitGroupQuery } from '@/types/gqlTypes';

const Units = () => {
  const { project } = useProjectDashboardContext();
  const { unitGroupId } = useSafeParams() as { unitGroupId: string };
  const { data, loading, error } = useGetUnitGroupQuery({
    variables: { id: unitGroupId },
  });
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  if (loading) return <Loading />;
  if (error) throw error;
  if (!data?.unitGroup) return <NotFound />;
  const canEdit = project.access.canManageUnits;

  return (
    <>
      <PageTitle
        overlineText={canEdit ? 'Manage Unit Group' : 'View Unit Group'}
        title={data.unitGroup.name}
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

      <Stack gap={4}>
        <div>Configuration</div>
        <div>Default Contacts</div>
        <div>Utilization</div>
        <CommonCard title='Capacity' padContent={false}>
          <UnitCapacityTable projectId={project.id} />
        </CommonCard>
        <Paper>
          <UnitManagementTable
            projectId={project.id}
            unitGroupId={unitGroupId}
            allowDeleteUnits={project.access.canManageUnits}
          />
        </Paper>
      </Stack>
      <CreateUnitsDialog
        projectId={project.id}
        unitGroupId={unitGroupId}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
};
export default Units;
