import { Grid, Paper, Stack, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';

import Breadcrumbs from '../elements/Breadcrumbs';
import Loading from '../elements/Loading';

import { InactiveChip } from './Project';

import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
import { useProjectCrumbs } from '@/modules/inventory/components/useProjectCrumbs';
import { Routes } from '@/routes/routes';
import { useGetInventoryQuery } from '@/types/gqlTypes';

const InventoryBeds = () => {
  // const navigate = useNavigate();
  const { inventoryId } = useParams() as {
    projectId: string;
    inventoryId: string;
  };
  const title = 'Beds and Units';
  const [crumbs, crumbsLoading, project] = useProjectCrumbs();

  const { data, loading, error } = useGetInventoryQuery({
    variables: { id: inventoryId },
  });

  // const onCompleted = useCallback(() => {
  //   navigate(generatePath(Routes.PROJECT, { projectId }), {
  //     state: { refetchInventory: false },
  //   });
  // }, [navigate, projectId]);

  if (loading || crumbsLoading) return <Loading />;
  if (!crumbs || !project) throw Error('Project not found');
  if (!data?.inventory) throw Error('Inventory not found');
  if (error) throw error;

  /**
   Actions:

   Delete Unit
   Undelete Unit
   Set Unit name

   Delete Bed
   Undelete Bed
   Set Bed name
   Set Bed gender
   Set Unit for Bed


   // LATER: bulk add
   */
  return (
    <ProjectLayout>
      <Breadcrumbs
        crumbs={[
          ...crumbs,
          { label: 'Inventory', to: Routes.EDIT_INVENTORY },
          { label: title, to: '' },
        ]}
      />
      <Stack direction={'row'} spacing={2} sx={{ mb: 4 }}>
        <Typography variant='h3' sx={{ pt: 0, mt: 0 }}>
          {title}
        </Typography>
        <InactiveChip project={project} />
      </Stack>
      <Grid container spacing={4}>
        <Grid item xs={9}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant='h5' sx={{ mb: 2 }}>
              Units
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant='h5' sx={{ mb: 2 }}>
              Beds
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </ProjectLayout>
  );
};
export default InventoryBeds;
