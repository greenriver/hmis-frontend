import { Alert, AlertTitle, DialogActions, DialogContent } from '@mui/material';
import DialogTitle from '@mui/material/DialogTitle';
import { Stack } from '@mui/system';
import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import CommonDialog from '@/components/elements/CommonDialog';
import LabeledCheckbox from '@/components/elements/input/LabeledCheckbox';
import TextInput from '@/components/elements/input/TextInput';
import ValidationErrorList from '@/modules/errors/components/ValidationErrorList';
import {
  emptyErrorState,
  ErrorState,
  partitionValidations,
} from '@/modules/errors/util';
import CreatableFormSelect from '@/modules/form/components/CreatableFormSelect';
import FormActions from '@/modules/form/components/FormActions';
import { isPickListOption } from '@/modules/form/types';
import {
  CreateServiceTypeMutation,
  PickListOption,
  PickListType,
  ServiceTypeFieldsFragment,
  UpdateServiceTypeMutation,
  useCreateServiceTypeMutation,
  useGetPickListQuery,
  useUpdateServiceTypeMutation,
  ValidationError,
} from '@/types/gqlTypes';
import { evictQuery } from '@/utils/cacheUtil';

interface ServiceTypeDialogProps {
  serviceType?: ServiceTypeFieldsFragment;
  dialogOpen: boolean;
  closeDialog: () => void;
}

const ServiceTypeDialog: React.FC<ServiceTypeDialogProps> = ({
  serviceType,
  dialogOpen,
  closeDialog,
}) => {
  const [name, setName] = useState(serviceType?.name || '');
  const [supportsBulkAssignment, setSupportsBulkAssignment] = useState(
    serviceType?.supportsBulkAssignment || false
  );
  const [serviceCategory, setServiceCategory] = useState<PickListOption | null>(
    null
  );
  const [errors, setErrors] = useState<ErrorState>(emptyErrorState);

  const mutationInput = useMemo(() => {
    return {
      name,
      supportsBulkAssignment,
      serviceCategoryId: !!serviceCategory?.label ? serviceCategory.code : null,
      serviceCategoryName: !serviceCategory?.label
        ? serviceCategory?.code
        : null,
    };
  }, [
    name,
    supportsBulkAssignment,
    serviceCategory?.label,
    serviceCategory?.code,
  ]);

  const {
    data: { pickList } = {},
    loading: pickListLoading,
    error: pickListError,
  } = useGetPickListQuery({
    variables: { pickListType: PickListType.CustomServiceCategories },
  });

  useEffect(() => {
    // When serviceType exists (meaning this is an edit dialog, not a new unsaved record),
    // populate its existing serviceCategory into the Service Category dropdown.
    // Do this in a useEffect so that it works regardless of whether the pickList is cached or fetched from network
    if (serviceType && pickList) {
      // Search in the picklist for the option matching this service's category
      const pickListOption = pickList.find(
        (p) => p.code === serviceType.categoryRecord.id
      );
      // If we didn't find it, the service category is probably a HUD service category (those aren't loaded in the picklist).
      // This *shouldn't* happen, since we now disallow adding custom service types to HUD service categories.
      // But just in case, handle this situation by creating a fake picklist option to display the correct name
      const fakePickListOption = {
        code: '', // This is a bit of a hack. It prevents an 'access denied' message when trying to edit other fields on a custom service type whose category contains one or more HUD service types
        label: serviceType.categoryRecord.name,
      };
      setServiceCategory(pickListOption || fakePickListOption);
    }
  }, [pickList, serviceType, dialogOpen]);

  const onClose = useCallback(() => {
    closeDialog();
    // Don't reset to defaults here - that would cause the update dialog to show null values on reopen
    setErrors(emptyErrorState);
  }, [setErrors, closeDialog]);

  const onMutationCompleted = useCallback(
    (errors: ValidationError[] = []) => {
      if (errors.length > 0) {
        setErrors(partitionValidations(errors));
      } else {
        evictQuery('serviceTypes');
        evictQuery('pickList', {
          pickListType: PickListType.CustomServiceCategories,
        });
        onClose();
      }
    },
    [setErrors, onClose]
  );

  const [updateServiceType, { error: updateError, loading: updateLoading }] =
    useUpdateServiceTypeMutation({
      variables: {
        id: serviceType?.id || '', // will always be present if update mutation is called
        input: mutationInput,
      },
      onCompleted: (data: UpdateServiceTypeMutation) => {
        onMutationCompleted(data.updateServiceType?.errors);
      },
    });

  const [createServiceType, { error: createError, loading: createLoading }] =
    useCreateServiceTypeMutation({
      variables: {
        input: mutationInput,
      },
      onCompleted: (data: CreateServiceTypeMutation) => {
        onMutationCompleted(data.createServiceType?.errors);
      },
    });

  if (createError) throw createError;
  if (updateError) throw updateError;
  if (pickListError) throw pickListError;

  return (
    <CommonDialog open={dialogOpen}>
      <DialogTitle>{serviceType ? 'Edit' : 'Create'} Service Type</DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Stack gap={2}>
          {errors.errors.length > 0 && (
            <Alert severity='error'>
              <AlertTitle>Failed to submit</AlertTitle>
              <ValidationErrorList errors={errors.errors} />
            </Alert>
          )}
          <TextInput
            label='Name'
            value={name}
            sx={{ width: 500, maxWidth: '100%' }}
            onChange={(e) => setName(e.target.value)}
          />
          <LabeledCheckbox
            label='Supports bulk assignment'
            value={supportsBulkAssignment}
            onChange={(_e, checked) => setSupportsBulkAssignment(checked)}
          />
          <CreatableFormSelect
            value={serviceCategory}
            options={pickList || []}
            onChange={(_e, value) => {
              setServiceCategory(isPickListOption(value) ? value : null);
            }}
            loading={pickListLoading}
            placeholder='Service Category'
            label='Service Category'
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <FormActions
          onSubmit={() => {
            if (!!serviceType) {
              updateServiceType();
            } else {
              createServiceType();
            }
          }}
          loading={createLoading || updateLoading}
          onDiscard={onClose}
        />
      </DialogActions>
    </CommonDialog>
  );
};

export default ServiceTypeDialog;
