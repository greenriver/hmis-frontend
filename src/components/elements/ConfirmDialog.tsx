import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import * as React from 'react';

interface Props extends Omit<DialogProps, 'title'> {
  title: React.ReactNode;
  open: boolean;
  loading: boolean;
  children: React.ReactNode;
  confirmText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationDialog = ({
  onConfirm,
  onCancel,
  title,
  children,
  open,
  loading,
  confirmText,
  ...other
}: Props) => {
  return (
    <Dialog open={open} keepMounted={false} {...other}>
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
