import AddIcon from '@mui/icons-material/Add';
import { Button, DialogActions, DialogContent } from '@mui/material';
import DialogTitle from '@mui/material/DialogTitle';
import { Stack } from '@mui/system';
import * as React from 'react';
import { useState } from 'react';
import CommonDialog from '@/components/elements/CommonDialog';
import LabeledCheckbox from '@/components/elements/input/LabeledCheckbox';
import TextInput from '@/components/elements/input/TextInput';
import FormActions from '@/modules/form/components/FormActions';
import FormSelect from '@/modules/form/components/FormSelect';
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

  const [createServiceType, { error, loading }] = useCreateServiceTypeMutation({
    variables: {
      input: {
        name,
        supportsBulkAssignment,
        serviceCategoryId: serviceCategory?.code || '',
      },
    },
    onCompleted: () => {
      evictQuery('serviceTypes');
      setDialogOpen(false);
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
            <FormSelect
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
            onDiscard={() => setDialogOpen(false)}
          />
        </DialogActions>
      </CommonDialog>
    </>
  );
};

export default NewServiceTypeButton;
