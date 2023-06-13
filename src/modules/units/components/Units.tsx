import AddIcon from '@mui/icons-material/Add';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { useCallback, useMemo, useRef, useState } from 'react';

import { useProjectDashboardContext } from '../../projects/components/ProjectDashboard';

import UnitCapacityTable from './UnitCapacityTable';

import CommonDialog from '@/components/elements/CommonDialog';
import { ColumnDef } from '@/components/elements/GenericTable';
import TitleCard from '@/components/elements/TitleCard';
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
  DynamicFormRef,
} from '@/modules/form/components/DynamicForm';
import FormDialogActionContent from '@/modules/form/components/FormDialogActionContent';
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
  const formRef = useRef<DynamicFormRef>(null);
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
      console.debug('submitting', input);
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
      ...(project.access.canManageInventory
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
        title='Units'
        actions={
          <ProjectPermissionsFilter
            id={project.id}
            permissions='canManageInventory'
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
      <TitleCard title='Capacity' sx={{ mb: 4 }}>
        <UnitCapacityTable projectId={project.id} />
      </TitleCard>
      {/* <Paper data-testid='unitTableCard'> */}
      <TitleCard title='Unit Management' sx={{ mb: 4 }} headerVariant='border'>
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
      </TitleCard>
      <CommonDialog open={!!dialogOpen} fullWidth onClose={closeDialog}>
        <DialogTitle>Add Units</DialogTitle>
        <DialogContent sx={{ my: 2 }}>
          {dialogOpen && (
            <DynamicForm
              ref={formRef}
              definition={UnitsDefinition}
              FormActionProps={{
                submitButtonText: 'Add Units',
                discardButtonText: 'Cancel',
                onDiscard: closeDialog,
              }}
              onSubmit={handleCreateUnits}
              loading={createUnitsLoading}
              errors={errors}
              hideSubmit
            />
          )}
        </DialogContent>
        <DialogActions>
          <FormDialogActionContent
            onSubmit={() => formRef.current && formRef.current.SubmitForm()}
            onDiscard={closeDialog}
            discardButtonText='Cancel'
            submitButtonText='Add Units'
            submitLoading={createUnitsLoading}
          />
        </DialogActions>
      </CommonDialog>
    </>
  );
};
export default Units;
