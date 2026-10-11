import { Link, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import {
  RELOAD_ONCE_SESSION_KEY,
  resetLocalSession,
  sendSessionKeepalive,
} from '@/modules/auth/api/sessions';
import { keepaliveOutcome } from '@/modules/auth/events';
import { HmisSessionProps } from '@/modules/auth/hooks/useSessionStatus';
import { reloadWindow } from '@/utils/location';

interface Props extends HmisSessionProps {
  promptToExtendBefore: number;
}

const SessionStatusManager: React.FC<Props> = ({
  status,
  promptToExtend,
  expireSession,
  promptToExtendBefore,
}) => {
  const [loading, setLoading] = useState(false);
  // JWT arm: keepalive answered, but the token didn't refresh
  const [renewFailed, setRenewFailed] = useState(false);
  // keepalive failed with a server error; the session may still be valid
  const [keepaliveError, setKeepaliveError] = useState(false);
  const [warningDismissed, setWarningDismissed] = useState(false);

  // Out of the warning window again (e.g. signed in again in another tab): the next
  // warning starts fresh.
  useEffect(() => {
    if (promptToExtend) return;
    setRenewFailed(false);
    setKeepaliveError(false);
    setWarningDismissed(false);
  }, [promptToExtend]);

  const handleResetSession = useCallback(() => {
    sessionStorage.removeItem(RELOAD_ONCE_SESSION_KEY);
    setLoading(true);
    resetLocalSession();
    reloadWindow();
  }, []);

  // user clicks "Keep me signed in"
  const handleKeepAlive = useCallback(() => {
    setLoading(true);
    setKeepaliveError(false);
    sendSessionKeepalive()
      .then((response) => {
        const outcome = keepaliveOutcome(response, promptToExtendBefore);
        // Show the timed-out notice over a cleared page; OK reloads to sign in.
        if (outcome === 'signedOut') return expireSession();
        if (outcome === 'reload') return reloadWindow();
        setLoading(false);
        if (outcome === 'renewFailed') setRenewFailed(true);
        if (outcome === 'error') setKeepaliveError(true);
      })
      .catch(() => reloadWindow());
  }, [expireSession, promptToExtendBefore]);

  // current session has ended, user clicks continue
  const handleReload = useCallback(() => {
    sessionStorage.removeItem(RELOAD_ONCE_SESSION_KEY);
    setLoading(true);
    reloadWindow();
  }, [setLoading]);

  switch (status) {
    case 'valid':
      if (!promptToExtend || warningDismissed) return null;
      if (renewFailed) {
        // Closing keeps the dialog shut for the rest of the countdown so the user can
        // save their work; at 0 the session expires as usual.
        return (
          <ConfirmationDialog
            open={true}
            confirmText='Close'
            title="Your session can't be extended"
            loading={false}
            hideCancelButton
            onConfirm={() => setWarningDismissed(true)}
            maxWidth='sm'
            fullWidth
          >
            <Typography>
              Save your work before your session expires, then sign in again.
            </Typography>
          </ConfirmationDialog>
        );
      }
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
          {keepaliveError && (
            <Typography color='error' sx={{ mt: 2 }}>
              Something went wrong. Please try again.
            </Typography>
          )}
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
