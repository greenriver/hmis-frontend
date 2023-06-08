import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { useCallback, useState } from 'react';

import { SubmitFormAllowedTypes } from '../types';

import EditRecord, {
  Props as EditRecordProps,
} from '@/modules/form/components/EditRecord';
import { PartialPick } from '@/utils/typeUtil';

export function useFormDialog<T extends SubmitFormAllowedTypes>() {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const openFormDialog = useCallback(() => setDialogOpen(true), []);
  const renderFormDialog = ({
    title,
    ...props
  }: PartialPick<EditRecordProps<T>, 'onCompleted' | 'title'>) => {
    return (
      <Dialog
        open={!!dialogOpen}
        fullWidth
        onClose={() => setDialogOpen(false)}
      >
        <DialogTitle
          typography='h5'
          sx={{ textTransform: 'none', mb: 2 }}
          color='text.primary'
        >
          {title}
        </DialogTitle>
        <DialogContent>
          <EditRecord<T>
            title={<></>}
            {...props}
            FormActionProps={{
              onDiscard: () => setDialogOpen(false),
              ...props.FormActionProps,
            }}
            onCompleted={(data: T) => {
              setDialogOpen(false);
              if (props.onCompleted) props.onCompleted(data);
            }}
            minGroupsForLeftNav={100}
          />
        </DialogContent>
      </Dialog>
    );
  };
  return {
    openFormDialog,
    renderFormDialog,
  };
}
