import AddIcon from '@mui/icons-material/Add';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Paper,
} from '@mui/material';
import { useCallback, useMemo, useState } from 'react';

import { useProjectDashboardContext } from '../../projects/components/ProjectDashboard';

import { ColumnDef } from '@/components/elements/GenericTable';
import PageTitle from '@/components/layout/PageTitle';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
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
import { evictUnitsQuery } from '@/modules/units/util';
import {
  CreateUnitsInput,
  DeleteUnitsDocument,
  DeleteUnitsMutation,
  DeleteUnitsMutationVariables,
  GetUnitsDocument,
  GetUnitsQuery,
  GetUnitsQueryVariables,
  UnitFieldsFragment,
  useCreateUnitsMutation,
} from '@/types/gqlTypes';

const Units = () => {
  const { project } = useProjectDashboardContext();
  const [errors, setErrors] = useState<ErrorState>(emptyErrorState);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
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

  const columns: ColumnDef<UnitFieldsFragment>[] = useMemo(() => {
    return [
      // TODO: maybe add back live input from UnitsTable
      { header: 'Name', render: 'name' },
      {
        header: 'Unit Type',
        render: (unit) => unit.unitType?.description,
      },
      // FIXME: add inventory-specific perm
      ...(project.access.canEditProjectDetails
        ? [
            {
              key: 'delete',
              width: '1%',
              render: (unit: UnitFieldsFragment) => (
                <DeleteMutationButton<
                  DeleteUnitsMutation,
                  DeleteUnitsMutationVariables
                >
                  variables={{ input: { unitIds: [unit.id] } }}
                  idPath={'deleteUnits.unitIds[0]'}
                  recordName='unit'
                  queryDocument={DeleteUnitsDocument}
                  ButtonProps={{ size: 'small' }}
                  onSuccess={() => evictUnitsQuery(project.id)}
                >
                  Delete
                </DeleteMutationButton>
              ),
            },
          ]
        : []),
    ];
  }, [project]);
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
              onClick={() => setDialogOpen(true)}
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
          columns={columns}
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
          Create Units
        </DialogTitle>
        <DialogContent sx={{}}>
          {dialogOpen && (
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
