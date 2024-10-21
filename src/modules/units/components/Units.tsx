import AddIcon from '@mui/icons-material/Add';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
} from '@mui/material';
import { useCallback, useMemo, useRef, useState } from 'react';

import UnitCapacityTable from './UnitCapacityTable';
import UnitManagementTable from './UnitManagementTable';

import CommonDialog from '@/components/elements/CommonDialog';
import TitleCard from '@/components/elements/TitleCard';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
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
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { evictUnitsQuery } from '@/modules/units/util';
import { CreateUnitsInput, useCreateUnitsMutation } from '@/types/gqlTypes';

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
          evictUnitsQuery(project.id);
          closeDialog();
        }
      },
      onError: (apolloError) => setErrors({ ...emptyErrorState, apolloError }),
    }
  );

  const handleCreateUnits: DynamicFormOnSubmit = useCallback(
    ({ rawValues }) => {
      const input = transformSubmitValues({
        definition: UnitsDefinition,
        values: rawValues,
        keyByFieldName: true,
      });
      input.projectId = project.id;
      if (!input.prefix) input.prefix = 'Unit';
      createUnits({ variables: { input: { input } as CreateUnitsInput } });
    },
    [createUnits, project]
  );
  const pickListArgs = useMemo(() => ({ projectId: project.id }), [project]);

  if (!project.access.canViewUnits) return <NotFound />;

  return (
    <>
      <PageTitle
        title='Units'
        actions={
          <ProjectPermissionsFilter
            id={project.id}
            permissions='canManageUnits'
          >
            <Button
              data-testid='addInventoryButton'
              onClick={() => setDialogOpen(true)}
              startIcon={<AddIcon />}
              variant='outlined'
            >
              Add Units
            </Button>
          </ProjectPermissionsFilter>
        }
      />
      <Stack gap={4}>
        <TitleCard title='Capacity' headerSx={{ p: 2 }}>
          <UnitCapacityTable projectId={project.id} />
        </TitleCard>
        <Paper>
          <UnitManagementTable
            projectId={project.id}
            allowDeleteUnits={project.access.canManageUnits}
          />
        </Paper>
      </Stack>
      <CommonDialog open={!!dialogOpen} fullWidth onClose={closeDialog}>
        <DialogTitle>Add Units</DialogTitle>
        <DialogContent sx={{ my: 2 }}>
          {dialogOpen && (
            <DynamicForm
              ref={formRef}
              definition={UnitsDefinition}
              pickListArgs={pickListArgs}
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
