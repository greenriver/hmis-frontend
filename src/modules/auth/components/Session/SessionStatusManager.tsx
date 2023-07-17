import { Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';

import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import { sendSessionKeepalive } from '@/modules/auth/api/sessions';
import { HmisSessionStatus } from '@/modules/auth/components/Session/useSessionStatus';
import useAuth from '@/modules/auth/hooks/useAuth';
import { reloadWindow } from '@/utils/location';

const SessionStatusManager: React.FC<HmisSessionStatus> = ({
  status,
  promptToExtend,
}) => {
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();

  // user clicks "Keep me signed in"
  const handleKeepAlive = useCallback(() => {
    setLoading(true);
    sendSessionKeepalive()
      .then(() => {
        setLoading(false);
      })
      .catch(() => {
        setUser(undefined);
      });
  }, [setUser]);

  // current session is invalid, user clicks continue
  const handleReload = useCallback(() => {
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
        >
          <Typography>Your session will expire soon!</Typography>
        </ConfirmationDialog>
      );
    case 'invalid':
      return (
        <ConfirmationDialog
          open={true}
          confirmText='Continue'
          title='Your session has ended'
          loading={loading}
          hideCancelButton
          onConfirm={handleReload}
        >
          <Typography>You may have signed out in another window</Typography>
        </ConfirmationDialog>
      );
    case 'expired':
      return (
        <ConfirmationDialog
          open={true}
          confirmText='Continue'
          title='Your session has expired'
          loading={loading}
          hideCancelButton
          onConfirm={handleReload}
        >
          <Typography>Your session has timed out due to inactivity.</Typography>
        </ConfirmationDialog>
      );
  }
};
export default SessionStatusManager;
