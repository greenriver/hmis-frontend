import { Link, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';

import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import {
  RELOAD_ONCE_SESSION_KEY,
  resetLocalSession,
  sendSessionKeepalive,
} from '@/modules/auth/api/sessions';
import { HmisSessionProps } from '@/modules/auth/hooks/useSessionStatus';
import { reloadWindow } from '@/utils/location';

const SessionStatusManager: React.FC<HmisSessionProps> = ({
  status,
  promptToExtend,
}) => {
  const [loading, setLoading] = useState(false);

  const handleResetSession = useCallback(() => {
    sessionStorage.removeItem(RELOAD_ONCE_SESSION_KEY);
    setLoading(true);
    resetLocalSession();
    reloadWindow();
  }, []);

  // user clicks "Keep me signed in"
  const handleKeepAlive = useCallback(() => {
    setLoading(true);
    sendSessionKeepalive()
      .then(() => setLoading(false))
      .catch(() => reloadWindow());
  }, []);

  // current session has ended, user clicks continue
  const handleReload = useCallback(() => {
    sessionStorage.removeItem(RELOAD_ONCE_SESSION_KEY);
    setLoading(true);
    reloadWindow();
  }, [setLoading]);

  switch (status) {
    case 'valid':
      if (!promptToExtend) return null;
      return (
        <ConfirmationDialog
          open={true}
          confirmText='Keep me signed-in'
          title='Are you still there?'
          loading={loading}
          hideCancelButton
          onConfirm={handleKeepAlive}
          maxWidth='sm'
          fullWidth
        >
          <Typography>
            Your session will expire soon due to inactivity.
          </Typography>
        </ConfirmationDialog>
      );
    case 'invalid':
      return (
        <ConfirmationDialog
          open={true}
          confirmText='OK'
          title='Your session has ended'
          loading={loading}
          hideCancelButton
          onConfirm={handleReload}
          maxWidth='sm'
          fullWidth
        >
          <>
            <Typography sx={{ mb: 2 }}>
              You may have signed out in another window. Click OK to log in
              again.
            </Typography>
            <Typography component='div'>
              Having trouble?
              <br />
              <Link component='button' onClick={handleResetSession}>
                Reset your session
              </Link>
            </Typography>
          </>
        </ConfirmationDialog>
      );
    case 'expired':
      return (
        <ConfirmationDialog
          open={true}
          confirmText='OK'
          title='Your session has expired'
          loading={loading}
          hideCancelButton
          onConfirm={handleReload}
          maxWidth='sm'
          fullWidth
        >
          <Typography>
            Your session has timed out due to inactivity. Click OK to log in
            again.
          </Typography>
        </ConfirmationDialog>
      );
  }
};
export default SessionStatusManager;
