import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useCallback, useState } from 'react';

import Loading from '../elements/Loading';

import { InactiveChip } from './Project';

import useSafeParams from '@/hooks/useSafeParams';
import {
  evictBedsQuery,
  evictUnitsQuery,
} from '@/modules/bedUnitManagement/bedUnitUtil';
import BedsTable from '@/modules/bedUnitManagement/components/BedsTable';
import UnitsTable from '@/modules/bedUnitManagement/components/UnitsTable';
import DynamicForm from '@/modules/form/components/DynamicForm';
import { BedsDefinition, UnitsDefinition } from '@/modules/form/data';
import {
  FormValues,
  transformSubmitValues,
} from '@/modules/form/util/formUtil';
import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
import { useProjectCrumbs } from '@/modules/inventory/components/useProjectCrumbs';
import { Routes } from '@/routes/routes';
import {
  CreateBedsInput,
  CreateUnitsInput,
  useCreateBedsMutation,
  useCreateUnitsMutation,
  useGetInventoryQuery,
  ValidationError,
} from '@/types/gqlTypes';

const InventoryBeds = () => {
  // const navigate = useNavigate();
  const { inventoryId } = useSafeParams() as {
    projectId: string;
    inventoryId: string;
  };
  const title = 'Beds and Units';
  const [crumbs, crumbsLoading, project] = useProjectCrumbs();
  const [dialogOpen, setDialogOpen] = useState<'BEDS' | 'UNITS' | null>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const { data, loading, error } = useGetInventoryQuery({
    variables: { id: inventoryId },
  });
  const closeDialog = useCallback(() => {
    setDialogOpen(null);
    setErrors([]);
  }, []);

  const [createBeds, { loading: createBedsLoading }] = useCreateBedsMutation({
    onCompleted: (data) => {
      if (data.createBeds?.errors?.length) {
        setErrors(data.createBeds?.errors);
      } else {
        evictBedsQuery(inventoryId);
        evictUnitsQuery(inventoryId);
        closeDialog();
      }
    },
  });
  const [createUnits, { loading: createUnitsLoading }] = useCreateUnitsMutation(
    {
      onCompleted: (data) => {
        if (data.createUnits?.errors?.length) {
          setErrors(data.createUnits?.errors);
        } else {
          // evictBedsQuery(inventoryId);
          evictUnitsQuery(inventoryId);
          closeDialog();
        }
      },
    }
  );

  const handleCreateBeds = useCallback(
    (values: FormValues) => {
      const input = transformSubmitValues({
        definition: BedsDefinition,
        values,
        keyByFieldName: true,
      });
      input.inventoryId = inventoryId;
      createBeds({ variables: { input: { input } as CreateBedsInput } });
    },
    [createBeds, inventoryId]
  );

  const handleCreateUnits = useCallback(
    (values: FormValues) => {
      const input = transformSubmitValues({
        definition: UnitsDefinition,
        values,
        keyByFieldName: true,
      });
      input.inventoryId = inventoryId;
      if (!input.prefix) input.prefix = 'Unit';
      console.log('submitting', input);
      createUnits({ variables: { input: { input } as CreateUnitsInput } });
    },
    [createUnits, inventoryId]
  );

  if (loading || crumbsLoading) return <Loading />;
  if (!crumbs || !project) throw Error('Project not found');
  if (!data?.inventory) throw Error('Inventory not found');
  if (error) throw error;

  return (
    <ProjectLayout
      crumbs={[
        ...crumbs,
        { label: 'Inventory', to: Routes.EDIT_INVENTORY },
        { label: title, to: '' },
      ]}
    >
      <Stack direction={'row'} spacing={2} sx={{ mb: 4 }}>
        <Typography variant='h3' sx={{ pt: 0, mt: 0 }}>
          {title}
        </Typography>
        <InactiveChip project={project} />
      </Stack>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Paper sx={{ mb: 4 }}>
            <Stack
              gap={3}
              direction='row'
              justifyContent={'space-between'}
              sx={{ m: 2, pr: 1, alignItems: 'center' }}
            >
              <Typography variant='h5' sx={{ mb: 0 }}>
                Units
              </Typography>
              <Button
                size='small'
                variant='outlined'
                color='secondary'
                onClick={() => setDialogOpen('UNITS')}
              >
                + Add Units
              </Button>
            </Stack>
            <UnitsTable inventoryId={inventoryId} />
          </Paper>
          <Paper sx={{ mb: 2 }}>
            <Stack
              gap={3}
              direction='row'
              justifyContent={'space-between'}
              sx={{ m: 2, pr: 1, alignItems: 'center' }}
            >
              <Typography variant='h5' sx={{ mb: 0 }}>
                Beds
              </Typography>
              <Button
                size='small'
                variant='outlined'
                color='secondary'
                onClick={() => setDialogOpen('BEDS')}
              >
                + Add Beds
              </Button>
            </Stack>
            <BedsTable inventoryId={inventoryId} />
          </Paper>
        </Grid>
      </Grid>
      <Dialog open={!!dialogOpen} fullWidth onClose={closeDialog}>
        <DialogTitle
          typography='h5'
          sx={{ textTransform: 'none', mb: 2 }}
          color='text.primary'
        >
          {dialogOpen === 'BEDS' ? 'Create Beds' : 'Create Units'}
        </DialogTitle>
        <DialogContent sx={{}}>
          {dialogOpen === 'UNITS' && (
            <DynamicForm
              definition={UnitsDefinition}
              submitButtonText='Create Units'
              discardButtonText='Cancel'
              onDiscard={closeDialog}
              onSubmit={handleCreateUnits}
              loading={createUnitsLoading}
              errors={errors}
            />
          )}
          {dialogOpen === 'BEDS' && (
            <DynamicForm
              definition={BedsDefinition}
              submitButtonText='Create Beds'
              discardButtonText='Cancel'
              onDiscard={closeDialog}
              onSubmit={handleCreateBeds}
              pickListRelationId={inventoryId}
              loading={createBedsLoading}
              errors={errors}
            />
          )}
        </DialogContent>
      </Dialog>
    </ProjectLayout>
  );
};
export default InventoryBeds;
