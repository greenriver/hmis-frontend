import { useMutation } from '@apollo/client';
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
import { evictUnitsQuery } from '@/modules/units/util';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  EventType,
  PickListType,
  UnitGroupDetailFieldsFragment,
  useCreateUnitGroupMutation,
  useGetPickListQuery,
  UpdateUnitGroupDocument,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface UnitGroupFormDialogProps {
  projectId: string;
  open: boolean;
  onClose: () => void;
  projectSupportsReferrals?: boolean;
  unitGroup?: UnitGroupDetailFieldsFragment | null;
}

const UnitGroupFormDialog: React.FC<UnitGroupFormDialogProps> = ({
  projectId,
  open,
  onClose,
  projectSupportsReferrals = false,
  unitGroup = null,
}) => {
  const isEditing = !!unitGroup;

  const [name, setName] = useState(unitGroup?.name || '');
  const [workflowTemplateIdentifier, setWorkflowTemplateIdentifier] = useState<
    string | null
  >(unitGroup?.workflowTemplateIdentifier || null);
  const [ceEventType, setCeEventType] = useState<EventType | null>(
    unitGroup?.ceEventType || null
  );
  const [errorState, setErrors] = useState<ErrorState>(emptyErrorState);
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    // Reset to initial values based on current unitGroup
    setName(unitGroup?.name || '');
    setWorkflowTemplateIdentifier(
      unitGroup?.workflowTemplateIdentifier || null
    );
    setCeEventType(unitGroup?.ceEventType || null);
    setErrors(emptyErrorState);
    onClose();
  }, [unitGroup, onClose]);

  const [createUnitGroup, { loading: createLoading }] =
    useCreateUnitGroupMutation({
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

  const [updateUnitGroup, { loading: updateLoading }] = useMutation(
    UpdateUnitGroupDocument,
    {
      onCompleted: (data: any) => {
        if (data.updateUnitGroup?.errors?.length) {
          setErrors(partitionValidations(data.updateUnitGroup.errors));
        } else if (data.updateUnitGroup?.unitGroup) {
          const unitGroupId = data.updateUnitGroup.unitGroup.id;
          evictUnitsQuery(projectId, unitGroupId);
          handleClose(); // Stay on current page for edit
        }
      },
      onError: (apolloError: any) =>
        setErrors({ ...emptyErrorState, apolloError }),
    }
  );

  const loading = createLoading || updateLoading;

  const handleSubmit = useCallback(() => {
    if (!name) return;

    if (isEditing && unitGroup) {
      updateUnitGroup({
        variables: {
          id: unitGroup.id,
          input: {
            name,
            projectId,
            workflowTemplateIdentifier,
            ceEventType,
          },
        },
      });
    } else {
      createUnitGroup({
        variables: {
          input: {
            name,
            projectId,
            workflowTemplateIdentifier,
            ceEventType,
          },
        },
      });
    }
  }, [
    name,
    isEditing,
    unitGroup,
    createUnitGroup,
    updateUnitGroup,
    projectId,
    workflowTemplateIdentifier,
    ceEventType,
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
    skip: !projectSupportsReferrals,
  });

  const {
    data: { pickList: ceEventPicklist } = {},
    loading: ceEventPicklistLoading,
    error: ceEventPicklistError,
  } = useGetPickListQuery({
    variables: {
      pickListType: PickListType.CeEvents,
    },
    skip: !projectSupportsReferrals,
  });

  if (templatePickListError) throw templatePickListError;
  if (ceEventPicklistError) throw ceEventPicklistError;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
      <DialogTitle>
        {isEditing ? 'Edit Unit Group' : 'Create Unit Group'}
      </DialogTitle>
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
          {projectSupportsReferrals && (
            <>
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
                helperText={
                  isEditing && workflowTemplateIdentifier
                    ? 'Workflow template cannot be changed once set.'
                    : 'Select a workflow template to use for filling vacancies in this unit group.'
                }
                disabled={isEditing && !!workflowTemplateIdentifier}
                onChange={(_event, option) => {
                  if (isPickListOption(option)) {
                    setWorkflowTemplateIdentifier(option.code);
                  }
                }}
              />
              <FormSelect
                value={ceEventType ? { code: ceEventType } : null}
                placeholder='Select CE Event Type'
                label={getRequiredLabel('CE Event Type', false)}
                loading={ceEventPicklistLoading}
                options={ceEventPicklist || []}
                helperText={
                  isEditing && ceEventType
                    ? 'CE Event Type cannot be changed once set.'
                    : 'Select the event type for referrals in this unit group.'
                }
                disabled={isEditing && !!ceEventType}
                onChange={(_event, option) => {
                  if (isPickListOption(option)) {
                    setCeEventType(option.code as EventType);
                  }
                }}
              />
            </>
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
            {isEditing ? 'Save Changes' : 'Create'}
          </LoadingButton>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default UnitGroupFormDialog;
