import { Typography } from '@mui/material';

import ConfirmationDialog from '@/components/elements/ConfirmationDialog';

interface Props {
  loading: boolean;
  onRetry: VoidFunction;
  onDismiss: VoidFunction;
}

const LogoutFailedDialog: React.FC<Props> = ({
  loading,
  onRetry,
  onDismiss,
}) => (
  <ConfirmationDialog
    open={true}
    title='You are still signed in'
    confirmText='Try again'
    cancelText='Stay signed in'
    loading={loading}
    onConfirm={onRetry}
    onCancel={onDismiss}
  >
    <Typography>
      Signing out did not finish, so you are still signed in. Anyone using this
      computer next could still get into your account.
    </Typography>
    <Typography sx={{ mt: 2 }}>
      Try signing out again. If that does not work, close all of your browser
      windows to make sure you are fully signed out. Let your administrator know
      if it keeps happening.
    </Typography>
  </ConfirmationDialog>
);

export default LogoutFailedDialog;
