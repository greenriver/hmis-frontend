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

import { useProjectDashboardContext } from './ProjectDashboard';
import { InactiveChip } from './ProjectOverview';

import Loading from '@/components/elements/Loading';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import {
  evictBedsQuery,
  evictUnitsQuery,
} from '@/modules/bedUnitManagement/bedUnitUtil';
import BedsTable from '@/modules/bedUnitManagement/components/BedsTable';
import UnitsTable from '@/modules/bedUnitManagement/components/UnitsTable';
import {
  emptyErrorState,
  ErrorState,
  partitionValidations,
} from '@/modules/errors/util';
import DynamicForm, {
  DynamicFormOnSubmit,
} from '@/modules/form/components/DynamicForm';
import { BedsDefinition, UnitsDefinition } from '@/modules/form/data';
import { transformSubmitValues } from '@/modules/form/util/formUtil';
import {
  CreateBedsInput,
  CreateUnitsInput,
  useCreateBedsMutation,
  useCreateUnitsMutation,
  useGetInventoryQuery,
} from '@/types/gqlTypes';

const InventoryBeds = () => {
  // const navigate = useNavigate();
  const { inventoryId } = useSafeParams() as {
    projectId: string;
    inventoryId: string;
  };
  const title = 'Beds and Units';
  const { project } = useProjectDashboardContext();
  const [dialogOpen, setDialogOpen] = useState<'BEDS' | 'UNITS' | null>(null);
  const [errors, setErrors] = useState<ErrorState>(emptyErrorState);
  const { data, loading, error } = useGetInventoryQuery({
    variables: { id: inventoryId },
  });
  const closeDialog = useCallback(() => {
    setDialogOpen(null);
    setErrors(emptyErrorState);
  }, []);

  const [createBeds, { loading: createBedsLoading }] = useCreateBedsMutation({
    onCompleted: (data) => {
      if (data.createBeds?.errors?.length) {
        setErrors(partitionValidations(data.createBeds?.errors));
      } else {
        evictBedsQuery(inventoryId);
        evictUnitsQuery(inventoryId);
        closeDialog();
      }
    },
    onError: (apolloError) => setErrors({ ...emptyErrorState, apolloError }),
  });
  const [createUnits, { loading: createUnitsLoading }] = useCreateUnitsMutation(
    {
      onCompleted: (data) => {
        if (data.createUnits?.errors?.length) {
          setErrors(partitionValidations(data.createUnits?.errors));
        } else {
          // evictBedsQuery(inventoryId);
          evictUnitsQuery(inventoryId);
          closeDialog();
        }
      },
      onError: (apolloError) => setErrors({ ...emptyErrorState, apolloError }),
    }
  );

  const handleCreateBeds: DynamicFormOnSubmit = useCallback(
    ({ values }) => {
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

  const handleCreateUnits: DynamicFormOnSubmit = useCallback(
    ({ values }) => {
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

  if (loading) return <Loading />;
  if (!data?.inventory) return <NotFound />;
  if (error) throw error;

  return (
    <>
      <PageTitle
        title={
          <>
            <Typography variant='h3' sx={{ pt: 0, mt: 0 }}>
              {title}
            </Typography>
            <InactiveChip project={project} />
          </>
        }
      />
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
              FormActionProps={{
                submitButtonText: 'Create Units',
                discardButtonText: 'Cancel',
                onDiscard: closeDialog,
              }}
              onSubmit={handleCreateUnits}
              loading={createUnitsLoading}
              errors={errors}
            />
          )}
          {dialogOpen === 'BEDS' && (
            <DynamicForm
              definition={BedsDefinition}
              FormActionProps={{
                submitButtonText: 'Create Beds',
                discardButtonText: 'Cancel',
                onDiscard: closeDialog,
              }}
              onSubmit={handleCreateBeds}
              pickListRelationId={inventoryId}
              loading={createBedsLoading}
              errors={errors}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
export default InventoryBeds;
