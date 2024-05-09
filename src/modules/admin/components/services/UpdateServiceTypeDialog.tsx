import { DialogActions, DialogContent } from '@mui/material';
import DialogTitle from '@mui/material/DialogTitle';
import * as React from 'react';
import { useState } from 'react';
import CommonDialog from '@/components/elements/CommonDialog';
import LabeledCheckbox from '@/components/elements/input/LabeledCheckbox';
import TextInput from '@/components/elements/input/TextInput';
import FormActions from '@/modules/form/components/FormActions';
import {
  ServiceTypeFieldsFragment,
  useUpdateServiceTypeMutation,
} from '@/types/gqlTypes';

interface UpdateServiceTypeDialogProps {
  serviceType: ServiceTypeFieldsFragment;
  dialogOpen: boolean;
  closeDialog: () => void;
}

const UpdateServiceTypeDialog: React.FC<UpdateServiceTypeDialogProps> = ({
  serviceType,
  dialogOpen,
  closeDialog,
}) => {
  const [name, setName] = useState(serviceType.name);
  const [supportsBulkAssignment, setSupportsBulkAssignment] = useState(
    serviceType.supportsBulkAssignment
  );

  const [updateServiceType, { error, loading }] = useUpdateServiceTypeMutation({
    variables: {
      id: serviceType.id,
      name: name,
      supportsBulkAssignment: supportsBulkAssignment,
    },
    onCompleted: closeDialog,
  });

  if (error) throw error;

  return (
    <CommonDialog open={dialogOpen}>
      <DialogTitle>Edit Service Type</DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <TextInput
          label='Name'
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <LabeledCheckbox
          label='Supports bulk assignment'
          checked={supportsBulkAssignment}
          onChange={(_e, checked) => setSupportsBulkAssignment(checked)}
        />
      </DialogContent>
      <DialogActions>
        <FormActions
          onSubmit={() => updateServiceType()}
          loading={loading}
          onDiscard={() => closeDialog()}
        />
      </DialogActions>
    </CommonDialog>
  );
};

export default UpdateServiceTypeDialog;
