import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import * as React from 'react';

interface Props extends DialogProps {
  title: string;
  open: boolean;
  loading: boolean;
  children: React.ReactNode;
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
  ...other
}: Props) => {
  return (
    <Dialog open={open} keepMounted={false} {...other}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{}}>{children}</DialogContent>
      <DialogActions sx={{ px: 4, pb: 2, justifyContent: 'center' }}>
        <Button onClick={onCancel} variant='gray'>
          Cancel
        </Button>
        <Button onClick={onConfirm} disabled={loading}>
          {loading ? 'Loading...' : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
