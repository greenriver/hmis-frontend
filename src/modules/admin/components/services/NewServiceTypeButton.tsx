import AddIcon from '@mui/icons-material/Add';
import {
  Alert,
  AlertTitle,
  Button,
  DialogActions,
  DialogContent,
} from '@mui/material';
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
  PickListOption,
  PickListType,
  useCreateServiceTypeMutation,
  useGetPickListQuery,
} from '@/types/gqlTypes';
import { evictQuery } from '@/utils/cacheUtil';

const NewServiceTypeButton = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [supportsBulkAssignment, setSupportsBulkAssignment] = useState(false);
  const [serviceCategory, setServiceCategory] = useState<PickListOption | null>(
    null
  );
  const [errors, setErrors] = useState<ErrorState>(emptyErrorState);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);

    // Reset to defaults
    setName('');
    setSupportsBulkAssignment(false);
    setServiceCategory(null);

    setErrors(emptyErrorState);
  }, [setName, setSupportsBulkAssignment, setServiceCategory, setErrors]);

  const [createServiceType, { error, loading }] = useCreateServiceTypeMutation({
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
    onCompleted: (data) => {
      const errors = data.createServiceType?.errors || [];
      if (errors.length > 0) {
        setErrors(partitionValidations(errors));
      } else {
        evictQuery('serviceTypes');
        closeDialog();
      }
    },
  });

  const {
    data: { pickList } = {},
    loading: pickListLoading,
    error: pickListError,
  } = useGetPickListQuery({
    variables: { pickListType: PickListType.CustomServiceCategories },
  });

  if (error) throw error;
  if (pickListError) throw pickListError;

  return (
    <>
      <Button
        startIcon={<AddIcon />}
        variant='outlined'
        onClick={() => setDialogOpen(true)}
      >
        New Service Type
      </Button>
      <CommonDialog open={dialogOpen}>
        <DialogTitle>Create Service Type</DialogTitle>
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
            onSubmit={() => createServiceType()}
            loading={loading}
            onDiscard={closeDialog}
          />
        </DialogActions>
      </CommonDialog>
    </>
  );
};

export default NewServiceTypeButton;
