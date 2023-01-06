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
import { useParams } from 'react-router-dom';

import { ColumnDef } from '../elements/GenericTable';
import GenericTableWithData from '../elements/GenericTableWithData';
import TextInput from '../elements/input/TextInput';
import Loading from '../elements/Loading';

import { InactiveChip } from './Project';

import DynamicForm from '@/modules/form/components/DynamicForm';
import { BedsDefinition, UnitsDefinition } from '@/modules/form/data';
import { FormValues } from '@/modules/form/util/formUtil';
import { transformSubmitValues } from '@/modules/form/util/recordFormUtil';
import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
import { useProjectCrumbs } from '@/modules/inventory/components/useProjectCrumbs';
import { Routes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  Bed,
  CreateBedsInput,
  CreateUnitsInput,
  GetBedsDocument,
  GetUnitsDocument,
  Unit,
  useCreateBedsMutation,
  useCreateUnitsMutation,
  useGetInventoryQuery,
} from '@/types/gqlTypes';

const unitColumns: ColumnDef<Unit>[] = [
  {
    key: 'name',
    header: 'Unit Name',
    width: '80%',
    render: (unit) => unit.name,
  },
  {
    key: 'count',
    header: '# Beds',
    width: '20%',
    render: (unit) => `${unit.bedCount} beds`,
  },
  {
    key: 'delete',
    render: () => (
      <Button size='small' variant='outlined'>
        Delete
      </Button>
    ),
  },
];

const bedColumns: ColumnDef<Bed>[] = [
  {
    key: 'type',
    header: 'Type',
    width: '20%',
    render: (bed) => HmisEnums.InventoryBedType[bed.bedType],
  },
  {
    key: 'name',
    header: 'Name',
    width: '30%',
    render: (bed) => <TextInput value={bed.name || ''} />,
  },
  {
    key: 'gender',
    header: 'Gender',
    width: '20%',
    render: (bed) => <TextInput value={bed.gender || ''} placeholder='Any' />,
  },
  {
    key: 'unit',
    header: 'Unit',
    width: '30%',
    render: (bed) => <TextInput value={bed.unit.name || bed.unit.id} />,
  },
  {
    key: 'delete',
    render: () => (
      <Button size='small' variant='outlined'>
        Delete
      </Button>
    ),
  },
];

const InventoryBeds = () => {
  // const navigate = useNavigate();
  const { inventoryId } = useParams() as {
    projectId: string;
    inventoryId: string;
  };
  const title = 'Beds and Units';
  const [crumbs, crumbsLoading, project] = useProjectCrumbs();
  const [dialogOpen, setDialogOpen] = useState<'BEDS' | 'UNITS' | null>(null);
  const { data, loading, error } = useGetInventoryQuery({
    variables: { id: inventoryId },
  });

  const [createBeds] = useCreateBedsMutation({
    onCompleted: () => setDialogOpen(null),
  });
  const [createUnits] = useCreateUnitsMutation({
    onCompleted: () => setDialogOpen(null),
  });

  const handleCreateBeds = useCallback(
    (values: FormValues) => {
      const input = transformSubmitValues({
        definition: BedsDefinition,
        values,
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
      });
      input.inventoryId = inventoryId;
      if (!input.prefix) input.prefix = 'Unit';
      createUnits({ variables: { input: { input } as CreateUnitsInput } });
    },
    [createUnits, inventoryId]
  );

  // const onCompleted = useCallback(() => {
  //   navigate(generatePath(Routes.PROJECT, { projectId }), {
  //     state: { refetchInventory: false },
  //   });
  // }, [navigate, projectId]);

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
          <Paper sx={{ p: 2, mb: 4 }}>
            <Stack
              gap={3}
              direction='row'
              justifyContent={'space-between'}
              sx={{ mb: 2, pr: 1, alignItems: 'center' }}
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
            <GenericTableWithData
              defaultPageSize={5}
              queryVariables={{ id: inventoryId }}
              queryDocument={GetUnitsDocument}
              columns={unitColumns}
              pagePath='inventory.units'
              noData='No units.'
            />
          </Paper>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Stack
              gap={3}
              direction='row'
              justifyContent={'space-between'}
              sx={{ mb: 2, pr: 1, alignItems: 'center' }}
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
            <GenericTableWithData
              defaultPageSize={5}
              queryVariables={{ id: inventoryId }}
              queryDocument={GetBedsDocument}
              columns={bedColumns}
              pagePath='inventory.beds'
              noData='No beds.'
            />
          </Paper>
        </Grid>
      </Grid>
      <Dialog open={!!dialogOpen} fullWidth onClose={() => setDialogOpen(null)}>
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
              onDiscard={() => setDialogOpen(null)}
              onSubmit={handleCreateUnits}
            />
          )}
          {dialogOpen === 'BEDS' && (
            <DynamicForm
              definition={BedsDefinition}
              submitButtonText='Create Beds'
              discardButtonText='Cancel'
              onDiscard={() => setDialogOpen(null)}
              onSubmit={handleCreateBeds}
              pickListRelationId={inventoryId}
            />
          )}
        </DialogContent>
      </Dialog>
    </ProjectLayout>
  );
};
export default InventoryBeds;
