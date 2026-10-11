import { Link, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import { HMIS_SESSION_REMAINING_HEADER } from '@/modules/auth/api/constants';
import {
  RELOAD_ONCE_SESSION_KEY,
  resetLocalSession,
  sendSessionKeepalive,
} from '@/modules/auth/api/sessions';
import { HmisSessionProps } from '@/modules/auth/hooks/useSessionStatus';
import { reloadWindow } from '@/utils/location';

interface Props extends HmisSessionProps {
  promptToExtendBefore: number;
}

const SessionStatusManager: React.FC<Props> = ({
  status,
  promptToExtend,
  promptToExtendBefore,
}) => {
  const [loading, setLoading] = useState(false);
  // JWT arm: keepalive answered, but the token didn't refresh
  const [renewFailed, setRenewFailed] = useState(false);
  const [warningDismissed, setWarningDismissed] = useState(false);

  // Out of the warning window again (e.g. signed in again in another tab): the next
  // warning starts fresh.
  useEffect(() => {
    if (promptToExtend) return;
    setRenewFailed(false);
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
    sendSessionKeepalive()
      .then((response) => {
        setLoading(false);
        // Still inside the warning window: the token didn't refresh, usually because
        // the IdP session is gone. A reload wouldn't help, since oauth2-proxy keeps
        // serving the old token until it expires.
        const remainingSecs = parseInt(
          response.headers.get(HMIS_SESSION_REMAINING_HEADER) || '',
          10
        );
        if (remainingSecs <= promptToExtendBefore) setRenewFailed(true);
      })
      .catch(() => reloadWindow());
  }, [promptToExtendBefore]);

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
