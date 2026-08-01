import { Typography } from '@mui/material';

import ConfirmationDialog from '@/components/elements/ConfirmationDialog';

interface Props {
  loading: boolean;
  onRetry: VoidFunction;
  onDismiss: VoidFunction;
  // Name of the user still being impersonated, as shown in the "Acting as" banner.
  impersonatedUserName?: string;
}

// Shown when exiting impersonation did not go through. Sibling of
// LogoutFailedDialog, and for the same reason: the generic "failed to connect"
// dialog described a network problem and offered a reload, which dropped the
// user back into the app still impersonating.
const StopImpersonatingFailedDialog: React.FC<Props> = ({
  loading,
  onRetry,
  onDismiss,
  impersonatedUserName,
}) => (
  <ConfirmationDialog
    open={true}
    title='You are still acting as another user'
    confirmText='Try again'
    cancelText='Keep acting as them'
    loading={loading}
    onConfirm={onRetry}
    onCancel={onDismiss}
  >
    <Typography>
      Exiting impersonation did not complete. You are still acting as{' '}
      {impersonatedUserName || 'another user'}, so anything you do next will
      happen as them.
    </Typography>
    <Typography sx={{ mt: 2 }}>
      Try again to return to your own account. If it keeps failing, reload the
      page.
    </Typography>
  </ConfirmationDialog>
);

export default StopImpersonatingFailedDialog;
