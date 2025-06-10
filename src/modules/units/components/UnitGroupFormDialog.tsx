import LoadingButton from '@mui/lab/LoadingButton';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from '@mui/material';
import { Box } from '@mui/system';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TextInput from '@/components/elements/input/TextInput';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import {
  emptyErrorState,
  ErrorState,
  partitionValidations,
} from '@/modules/errors/util';
import FormSelect from '@/modules/form/components/FormSelect';
import { getRequiredLabel } from '@/modules/form/components/RequiredLabel';
import { isPickListOption } from '@/modules/form/types';
import { useHasRootPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { evictUnitsQuery } from '@/modules/units/util';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  PickListType,
  useCreateUnitGroupMutation,
  useGetPickListQuery,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface UnitGroupFormDialogProps {
  projectId: string;
  open: boolean;
  onClose: () => void;
}

const UnitGroupFormDialog: React.FC<UnitGroupFormDialogProps> = ({
  projectId,
  open,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [workflowTemplateIdentifier, setWorkflowTemplateIdentifier] = useState<
    string | null
  >(null);
  const [errorState, setErrors] = useState<ErrorState>(emptyErrorState);
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    setName('');
    setWorkflowTemplateIdentifier(null);
    setErrors(emptyErrorState);
    onClose();
  }, [onClose]);

  const [createUnitGroup, { loading }] = useCreateUnitGroupMutation({
    onCompleted: (data) => {
      if (data.createUnitGroup?.errors?.length) {
        setErrors(partitionValidations(data.createUnitGroup.errors));
      } else if (data.createUnitGroup?.unitGroup) {
        const unitGroupId = data.createUnitGroup.unitGroup.id;
        evictUnitsQuery(projectId, unitGroupId);
        handleClose();
        navigate(
          generateSafePath(ProjectDashboardRoutes.UNIT_GROUP, {
            projectId,
            unitGroupId,
          })
        );
      }
    },
    onError: (apolloError) => setErrors({ ...emptyErrorState, apolloError }),
  });

  const handleSubmit = useCallback(() => {
    if (!name) return;

    createUnitGroup({
      variables: { input: { name, projectId, workflowTemplateIdentifier } },
    });
  }, [name, projectId, workflowTemplateIdentifier, createUnitGroup]);

  const [canViewCoordinatedEntry] = useHasRootPermissions([
    'canViewCoordinatedEntry',
  ]);

  const {
    data: { pickList: templatePickList } = {},
    loading: templatePickListLoading,
    error: templatePickListError,
  } = useGetPickListQuery({
    variables: {
      pickListType: PickListType.CeWorkflowTemplateIdentifiers,
      projectId: projectId,
    },
    skip: !canViewCoordinatedEntry,
  });

  if (templatePickListError) throw templatePickListError;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
      <DialogTitle>Create Unit Group</DialogTitle>
      <DialogContent sx={{ my: 2 }}>
        {errorState.errors.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <ErrorAlert key='errors' errors={errorState.errors} fixable />
          </Box>
        )}
        <ApolloErrorAlert error={errorState.apolloError} />
        <Stack gap={2}>
          <TextInput
            label={getRequiredLabel('Unit Group Name', true)}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {canViewCoordinatedEntry && (
            <FormSelect
              value={
                workflowTemplateIdentifier
                  ? { code: workflowTemplateIdentifier }
                  : null
              }
              placeholder='Select Workflow'
              label={getRequiredLabel('Referral Workflow', false)}
              loading={templatePickListLoading}
              options={templatePickList || []}
              helperText='Select a workflow template to use for filling vacancies in this unit group.'
              onChange={(_event, option) => {
                if (isPickListOption(option)) {
                  setWorkflowTemplateIdentifier(option.code);
                }
              }}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Stack gap={3} direction='row'>
          <Button onClick={handleClose} disabled={loading} color='grayscale'>
            Cancel
          </Button>
          <LoadingButton
            onClick={handleSubmit}
            loading={loading}
            disabled={!name}
          >
            Create
          </LoadingButton>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default UnitGroupFormDialog;
