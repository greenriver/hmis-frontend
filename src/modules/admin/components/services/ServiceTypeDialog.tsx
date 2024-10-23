import { Alert, AlertTitle, DialogActions, DialogContent } from '@mui/material';
import DialogTitle from '@mui/material/DialogTitle';
import { Stack } from '@mui/system';
import * as React from 'react';
import { useCallback, useState } from 'react';
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

interface UpdateServiceTypeDialogProps {
  serviceType?: ServiceTypeFieldsFragment;
  dialogOpen: boolean;
  closeDialog: () => void;
}

const ServiceTypeDialog: React.FC<UpdateServiceTypeDialogProps> = ({
  serviceType,
  dialogOpen,
  closeDialog,
}) => {
  const [name, setName] = useState(serviceType?.name || '');
  const [supportsBulkAssignment, setSupportsBulkAssignment] = useState(
    serviceType?.supportsBulkAssignment || false
  );
  const [serviceCategory, setServiceCategory] = useState<PickListOption | null>(
    null // todo @martha - need to resolve the service type's category ID
  );
  const [errors, setErrors] = useState<ErrorState>(emptyErrorState);

  const {
    data: { pickList } = {},
    loading: pickListLoading,
    error: pickListError,
  } = useGetPickListQuery({
    variables: { pickListType: PickListType.CustomServiceCategories },
  });

  const onClose = useCallback(() => {
    closeDialog();

    // Reset to defaults
    setName('');
    setSupportsBulkAssignment(false);
    setServiceCategory(null);

    setErrors(emptyErrorState);
  }, [
    setName,
    setSupportsBulkAssignment,
    setServiceCategory,
    setErrors,
    closeDialog,
  ]);

  const onMutationCompleted = useCallback(
    (errors: ValidationError[] = []) => {
      if (errors.length > 0) {
        setErrors(partitionValidations(errors));
      } else {
        evictQuery('serviceTypes');
        onClose();
      }
    },
    [setErrors, onClose]
  );

  const [updateServiceType, { error: updateError, loading: updateLoading }] =
    useUpdateServiceTypeMutation({
      variables: {
        id: serviceType?.id || '', // will always be present if update mutation is called
        name: name,
        supportsBulkAssignment: supportsBulkAssignment,
      },
      onCompleted: (data: UpdateServiceTypeMutation) => {
        onMutationCompleted(data.updateServiceType?.errors);
      },
    });

  const [createServiceType, { error: createError, loading: createLoading }] =
    useCreateServiceTypeMutation({
      variables: {
        input: {
          name,
          supportsBulkAssignment,
          serviceCategoryId: !!serviceCategory?.label
            ? serviceCategory.code
            : null,
          serviceCategoryName: !serviceCategory?.label
            ? serviceCategory?.code
            : null,
        },
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
