import { Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';

import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import { sendSessionKeepalive } from '@/modules/auth/api/sessions';
import { HmisSessionProps } from '@/modules/auth/hooks/useSessionStatus';
import { reloadWindow } from '@/utils/location';

const SessionStatusManager: React.FC<HmisSessionProps> = ({
  status,
  promptToExtend,
}) => {
  const [loading, setLoading] = useState(false);

  // user clicks "Keep me signed in"
  const handleKeepAlive = useCallback(() => {
    setLoading(true);
    sendSessionKeepalive()
      .then(() => setLoading(false))
      .catch(() => reloadWindow());
  }, []);

  // current session has ended, user clicks continue
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
