import { Link, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import {
  RELOAD_ONCE_SESSION_KEY,
  resetLocalSession,
  sendSessionKeepalive,
} from '@/modules/auth/api/sessions';
import { sessionRemainingSecsFromHeaders } from '@/modules/auth/events';
import { HmisSessionProps } from '@/modules/auth/hooks/useSessionStatus';
import { reloadWindow } from '@/utils/location';

interface Props extends HmisSessionProps {
  promptToExtendBefore: number;
}

// notRenewed: JWT arm only, the keepalive succeeded but the token didn't refresh,
// usually because the IdP session is gone. A reload wouldn't help: oauth2-proxy keeps
// serving the old token until it expires.
type KeepaliveNotice = 'error' | 'notRenewed' | 'dismissed';

const SessionStatusManager: React.FC<Props> = ({
  status,
  promptToExtend,
  promptToExtendBefore,
}) => {
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<KeepaliveNotice>();

  // the next warning starts fresh
  useEffect(() => {
    if (!promptToExtend) setNotice(undefined);
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
        // signed out or refused: a reload shows the sign-in or terminal page
        if (response.status === 401 || response.status === 403) {
          return reloadWindow();
        }
        setLoading(false);
        // may be transient; don't reload away unsaved work
        if (!response.ok) return setNotice('error');
        const remainingSecs = sessionRemainingSecsFromHeaders(response.headers);
        if (
          remainingSecs !== undefined &&
          remainingSecs <= promptToExtendBefore
        ) {
          setNotice('notRenewed');
        }
      })
      .catch(() => {
        setLoading(false);
        setNotice('error');
      });
  }, [promptToExtendBefore]);

  // current session has ended, user clicks continue
  const handleReload = useCallback(() => {
    sessionStorage.removeItem(RELOAD_ONCE_SESSION_KEY);
    setLoading(true);
    reloadWindow();
  }, [setLoading]);

  switch (status) {
    case 'valid':
      if (!promptToExtend || notice === 'dismissed') return null;
      if (notice === 'notRenewed') {
        // Close leaves the page usable until the session expires
        return (
          <ConfirmationDialog
            open={true}
            confirmText='Close'
            title="Your session can't be extended"
            loading={false}
            hideCancelButton
            onConfirm={() => setNotice('dismissed')}
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
          {notice === 'error' && (
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
