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
  if (tracking && user && tracking.userId === user.id) {
    const { timestamp } = tracking;
    const now = currentTimeInSeconds();
    if (timestamp + user.sessionDuration > now) {
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
    console.info('cached valid user', cachedUser);
    const promises: Array<Promise<any>> = [];

    const saveSettings = (value: HmisAppSettings) => {
      setAppSettings(value);
      storage.setAppSettings(value);
    };

    if (cachedUser) {
      setUser(cachedUser);
      const cachedAppSettings = storage.getAppSettings();
      console.info('cached valid settings', cachedAppSettings);
      if (cachedAppSettings) {
        setAppSettings(cachedAppSettings);
      } else {
        promises.push(fetchHmisAppSettings().then(saveSettings));
      }
    } else {
      console.info('no cached user');
      promises.push(fetchCurrentUser().then(setUser));
      promises.push(fetchHmisAppSettings().then(saveSettings));
    }

    if (promises.length) {
      Promise.all(promises)
        .catch(setError)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
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
        title='An error occurred'
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
