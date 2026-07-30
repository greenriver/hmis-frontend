import { Typography } from '@mui/material';

import ConfirmationDialog from '@/components/elements/ConfirmationDialog';

interface Props {
  loading: boolean;
  onRetry: VoidFunction;
  onDismiss: VoidFunction;
  // Under 'jwt' the sign-out also ends the IdP session, so a failure leaves that
  // session live too and the user needs to hear it. A Devise/Okta sign-out never
  // touched the IdP session either way, so mentioning it there would be noise.
  // Passed in rather than read from app settings to keep this presentational.
  authMethod: 'devise' | 'jwt';
}

// Shown when an explicit sign-out did not go through. The point of the copy is
// that the session is still live -- the old generic "failed to connect" dialog
// left users thinking they were signed out when they were not.
const LogoutFailedDialog: React.FC<Props> = ({
  loading,
  onRetry,
  onDismiss,
  authMethod,
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
      Signing out did not complete.{' '}
      {authMethod === 'jwt'
        ? 'You are still signed in here and with your identity provider, so anyone using this computer next could still reach your account.'
        : 'You are still signed in, so anyone using this computer next could still reach your account.'}
    </Typography>
    <Typography sx={{ mt: 2 }}>
      Try signing out again. If it keeps failing, close every browser window
      before you walk away.
    </Typography>
  </ConfirmationDialog>
);

export default LogoutFailedDialog;
