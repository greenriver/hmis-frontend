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
  useUpdateUnitGroupMutation,
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
  const [unitTypeId, setUnitTypeId] = useState<string | null>(
    unitGroup?.unitType?.id || null
  );
  const [workflowTemplateIdentifier, setWorkflowTemplateIdentifier] = useState<
    string | null
  >(unitGroup?.workflowTemplateIdentifier || null);
  const [
    directReferralWorkflowTemplateIdentifier,
    setDirectReferralWorkflowTemplateIdentifier,
  ] = useState<string | null>(
    unitGroup?.directReferralWorkflowTemplateIdentifier || null
  );
  const [ceEventType, setCeEventType] = useState<EventType | null>(
    unitGroup?.ceEventType || null
  );
  const [errorState, setErrors] = useState<ErrorState>(emptyErrorState);
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    // Reset to initial values based on current unitGroup
    setName(unitGroup?.name || '');
    setUnitTypeId(unitGroup?.unitType?.id || null);
    setWorkflowTemplateIdentifier(
      unitGroup?.workflowTemplateIdentifier || null
    );
    setDirectReferralWorkflowTemplateIdentifier(
      unitGroup?.directReferralWorkflowTemplateIdentifier || null
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

  const [updateUnitGroup, { loading: updateLoading }] =
    useUpdateUnitGroupMutation({
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
    });

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
            directReferralWorkflowTemplateIdentifier,
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
            unitTypeId,
            workflowTemplateIdentifier,
            directReferralWorkflowTemplateIdentifier,
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
    unitTypeId,
    workflowTemplateIdentifier,
    directReferralWorkflowTemplateIdentifier,
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

  const {
    data: { pickList: unitTypePickList } = {},
    loading: unitTypePickListLoading,
    error: unitTypePickListError,
  } = useGetPickListQuery({
    variables: {
      pickListType: PickListType.PossibleUnitTypesForProject,
      projectId: projectId,
    },
  });

  const workflowTemplateIdentifierDisabled =
    isEditing && !!unitGroup?.workflowTemplateIdentifier;
  const directReferralWorkflowTemplateIdentifierDisabled =
    isEditing && !!unitGroup?.directReferralWorkflowTemplateIdentifier;

  if (templatePickListError) throw templatePickListError;
  if (ceEventPicklistError) throw ceEventPicklistError;
  if (unitTypePickListError) throw unitTypePickListError;

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
          <FormSelect
            value={unitTypeId ? { code: unitTypeId } : null}
            label={getRequiredLabel('Unit Type', true)}
            placeholder='Select Unit Type'
            loading={unitTypePickListLoading}
            options={unitTypePickList || []}
            helperText={
              isEditing
                ? 'Unit type cannot be changed.'
                : 'Select the unit type for this group.'
            }
            disabled={isEditing}
            onChange={(_event, option) => {
              if (isPickListOption(option)) {
                setUnitTypeId(option.code);
              } else if (!option) {
                setUnitTypeId(null);
              }
            }}
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
                  workflowTemplateIdentifierDisabled
                    ? 'Workflow template cannot be changed once set.'
                    : 'Select a workflow template to use for filling vacancies in this unit group. If blank, referrals cannot be created from client lists in this unit group.'
                }
                disabled={workflowTemplateIdentifierDisabled}
                onChange={(_event, option) => {
                  if (isPickListOption(option)) {
                    setWorkflowTemplateIdentifier(option.code);
                  } else if (!option) {
                    setWorkflowTemplateIdentifier(null);
                  }
                }}
              />
              <FormSelect
                value={
                  directReferralWorkflowTemplateIdentifier
                    ? { code: directReferralWorkflowTemplateIdentifier }
                    : null
                }
                placeholder='Select Direct Referral Workflow'
                label={getRequiredLabel('Workflow for Direct Referrals', false)}
                loading={templatePickListLoading}
                options={templatePickList || []}
                helperText={
                  directReferralWorkflowTemplateIdentifierDisabled
                    ? 'Workflow template for direct referrals cannot be changed once set.'
                    : 'Select a workflow template to use for direct referrals in this unit group. If blank, the workflow template above will be used. If both are blank, direct referrals cannot be created in this group.'
                }
                disabled={directReferralWorkflowTemplateIdentifierDisabled}
                onChange={(_event, option) => {
                  if (isPickListOption(option)) {
                    setDirectReferralWorkflowTemplateIdentifier(option.code);
                  } else if (!option) {
                    setDirectReferralWorkflowTemplateIdentifier(null);
                  }
                }}
              />
              <FormSelect
                value={ceEventType ? { code: ceEventType } : null}
                placeholder='Select CE Event Type'
                label={getRequiredLabel('CE Event Type', false)}
                loading={ceEventPicklistLoading}
                options={ceEventPicklist || []}
                helperText='Select the event type for referrals in this unit group.'
                onChange={(_event, option) => {
                  if (isPickListOption(option)) {
                    setCeEventType(option.code as EventType);
                  } else if (!option) {
                    setCeEventType(null);
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
            disabled={!name || !unitTypeId}
          >
            {isEditing ? 'Save Changes' : 'Create'}
          </LoadingButton>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default UnitGroupFormDialog;
