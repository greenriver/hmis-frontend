import { Typography } from '@mui/material';
import { ReactNode, useEffect, useMemo, useState } from 'react';

import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import Loading from '@/components/elements/Loading';
import { fetchCurrentUser, HmisUser } from '@/modules/auth/api/sessions';
import * as storage from '@/modules/auth/api/storage';
import { HmisAuthContext, HmisAuthState } from '@/modules/auth/AuthContext';
import { useSessionTrackingObserver } from '@/modules/auth/hooks/useSessionTrackingObserver';
import { fetchHmisAppSettings } from '@/modules/hmisAppSettings/api';
import { HmisAppSettingsContext } from '@/modules/hmisAppSettings/Context';
import { HmisAppSettings } from '@/modules/hmisAppSettings/types';
import { reloadWindow } from '@/utils/location';
import { currentTimeInSeconds } from '@/utils/time';

// cached user if the session has not expired
const getValidCachedUser = (): HmisUser | undefined => {
  const tracking = storage.getSessionTracking();
  const user = storage.getUser();
  if (tracking && user && tracking.userId === tracking.userId) {
    const { timestamp } = tracking;
    if (timestamp + user.sessionDuration < currentTimeInSeconds()) {
      return user;
    }
  }
};

interface Props {
  children: ReactNode;
}
export const HmisAppSettingsProvider: React.FC<Props> = ({ children }) => {
  const [appSettings, setAppSettings] = useState<HmisAppSettings>();
  const [user, setUser] = useState<HmisUser>();
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState(true);

  // auth state for global context
  const authState = useMemo<HmisAuthState>(
    () => ({
      user: user,
      setUser,
    }),
    [user]
  );

  // tracking needs to be in place before we start making API calls
  useSessionTrackingObserver();

  // fetch data from remote
  useEffect(() => {
    const cachedUser = getValidCachedUser();
    const promises: Array<Promise<any>> = [];

    if (cachedUser) {
      setUser(cachedUser);
      const cachedSettings = storage.getAppSettings();
      if (cachedSettings) {
        setAppSettings(cachedSettings);
      } else {
        promises.push(fetchHmisAppSettings().then(setAppSettings));
      }
    } else {
      promises.push(fetchCurrentUser().then(setUser));
      promises.push(fetchHmisAppSettings().then(setAppSettings));
    }

    if (promises.length) {
      setLoading(true);
      Promise.all(promises)
        .then(() => setError(undefined))
        .catch(setError)
        .finally(() => setLoading(false));
    }
  }, []);

  // handle side-effects
  useEffect(() => {
    if (appSettings?.appName) document.title = appSettings.appName;
  }, [appSettings?.appName]);

  if (loading) return <Loading />;
  if (error) {
    return (
      <ConfirmationDialog
        open={true}
        confirmText='Continue'
        title='An error occured'
        loading={loading}
        hideCancelButton
        onConfirm={reloadWindow}
      >
        <Typography>Failed to connect to the server</Typography>
      </ConfirmationDialog>
    );
  }

  if (!appSettings) throw new Error(); // shouldn't get here
  return (
    <HmisAppSettingsContext.Provider value={appSettings}>
      <HmisAuthContext.Provider value={authState}>
        {children}
      </HmisAuthContext.Provider>
    </HmisAppSettingsContext.Provider>
  );
};
