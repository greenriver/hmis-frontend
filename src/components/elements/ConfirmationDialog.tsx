import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import * as React from 'react';

import LoadingButton from '@/components/elements/LoadingButton';

export interface ConfirmationDialogProps extends DialogProps {
  loading: boolean;
  children: React.ReactNode;
  confirmText?: string;
  onConfirm: React.MouseEventHandler<HTMLButtonElement>;
  onCancel: () => void;
}

const ConfirmationDialog = ({
  onConfirm,
  onCancel,
  title,
  children,
  loading,
  confirmText,
  ...other
}: ConfirmationDialogProps) => {
  return (
    <Dialog keepMounted={false} {...other}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{}}>{children}</DialogContent>
      <DialogActions sx={{ px: 4, pb: 2, justifyContent: 'center' }}>
        <Button
          onClick={onCancel}
          variant='gray'
          data-testid='cancelDialogAction'
        >
          Cancel
        </Button>
        <LoadingButton
          onClick={onConfirm}
          type='submit'
          loading={loading}
          data-testid='confirmDialogAction'
        >
          {confirmText || 'Confirm'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
