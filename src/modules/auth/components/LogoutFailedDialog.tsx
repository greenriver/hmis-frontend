import { Typography } from '@mui/material';

import ConfirmationDialog from '@/components/elements/ConfirmationDialog';

interface Props {
  loading: boolean;
  onRetry: VoidFunction;
  onDismiss: VoidFunction;
  // Selects the copy: a 'jwt' sign-out also ends the IdP session, so its failure
  // leaves that session live and the user has to be told. A Devise/Okta sign-out
  // never ends the IdP session, so naming one there would be noise.
  authMethod: 'devise' | 'jwt';
}

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
      Try signing out again. If it keeps failing, quitting your browser
      completely will usually end the session. Let your administrator know if it
      persists.
    </Typography>
  </ConfirmationDialog>
);

export default LogoutFailedDialog;
