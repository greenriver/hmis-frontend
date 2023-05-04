import AddIcon from '@mui/icons-material/Add';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Paper,
} from '@mui/material';
import { useCallback, useState } from 'react';

import { useProjectDashboardContext } from './ProjectDashboard';

import PageTitle from '@/components/layout/PageTitle';
import { evictUnitsQuery } from '@/modules/bedUnitManagement/bedUnitUtil';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import {
  emptyErrorState,
  ErrorState,
  partitionValidations,
} from '@/modules/errors/util';
import DynamicForm, {
  DynamicFormOnSubmit,
} from '@/modules/form/components/DynamicForm';
import { UnitsDefinition } from '@/modules/form/data';
import { transformSubmitValues } from '@/modules/form/util/formUtil';
import { ProjectPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import {
  CreateUnitsInput,
  GetUnitsDocument,
  GetUnitsQuery,
  GetUnitsQueryVariables,
  UnitFieldsFragment,
  useCreateUnitsMutation,
} from '@/types/gqlTypes';

const Units = () => {
  const { project } = useProjectDashboardContext();
  const [errors, setErrors] = useState<ErrorState>(emptyErrorState);
  const [dialogOpen, setDialogOpen] = useState<'BEDS' | 'UNITS' | null>(null);

  const closeDialog = useCallback(() => {
    setDialogOpen(null);
    setErrors(emptyErrorState);
  }, []);
  const [createUnits, { loading: createUnitsLoading }] = useCreateUnitsMutation(
    {
      onCompleted: (data) => {
        if (data.createUnits?.errors?.length) {
          setErrors(partitionValidations(data.createUnits?.errors));
        } else {
          // evictBedsQuery(inventoryId);
          evictUnitsQuery(project.id);
          closeDialog();
        }
      },
      onError: (apolloError) => setErrors({ ...emptyErrorState, apolloError }),
    }
  );

  const handleCreateUnits: DynamicFormOnSubmit = useCallback(
    ({ values }) => {
      const input = transformSubmitValues({
        definition: UnitsDefinition,
        values,
        keyByFieldName: true,
      });
      input.projectId = project.id;
      if (!input.prefix) input.prefix = 'Unit';
      console.log('submitting', input);
      createUnits({ variables: { input: { input } as CreateUnitsInput } });
    },
    [createUnits, project]
  );

  return (
    <>
      <PageTitle
        title='Unit Management'
        actions={
          <ProjectPermissionsFilter
            id={project.id}
            permissions='canEditProjectDetails'
          >
            <Button
              data-testid='addInventoryButton'
              onClick={() => setDialogOpen('UNITS')}
              startIcon={<AddIcon />}
              variant='outlined'
              color='secondary'
            >
              Add Units
            </Button>
          </ProjectPermissionsFilter>
        }
      />
      {/* <Paper>overview</Paper> */}
      <Paper data-testid='unitTableCard'>
        <GenericTableWithData<
          GetUnitsQuery,
          GetUnitsQueryVariables,
          UnitFieldsFragment
        >
          defaultPageSize={10}
          queryVariables={{ id: project.id }}
          queryDocument={GetUnitsDocument}
          columns={[
            { header: 'Name', render: 'name' },
            {
              header: 'Unit Type',
              render: (unit) => unit.unitType?.description,
            },
          ]}
          pagePath='project.units'
          noData='No units.'
        />
      </Paper>
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
        </DialogContent>
      </Dialog>
    </>
  );
};
export default Units;
