import { Typography } from '@mui/material';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import Loading from '@/components/elements/Loading';
import { fetchCurrentUser, HmisUser } from '@/modules/auth/api/sessions';
import { getSessionTracking, getUser } from '@/modules/auth/api/storage';
import { HmisAuthContext, HmisAuthState } from '@/modules/auth/AuthContext';
import { useSessionTrackingObserver } from '@/modules/auth/hooks/useSessionTrackingObserver';
import { fetchHmisAppSettings } from '@/modules/hmisAppSettings/api';
import { HmisAppSettingsContext } from '@/modules/hmisAppSettings/Context';
import { HmisAppSettings } from '@/modules/hmisAppSettings/types';
import { reloadWindow } from '@/utils/location';
import { currentTimeInSeconds } from '@/utils/time';

// if the session has expired, return undefined
const getCurrentUserWithCache = (): Promise<HmisUser | undefined> => {
  const expiry = getSessionTracking();
  const storedUser = getUser();
  if (expiry && storedUser) {
    if (
      expiry.timestamp + storedUser.sessionDuration <
      currentTimeInSeconds()
    ) {
      return Promise.resolve(storedUser);
    }
  }
  return fetchCurrentUser();
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
  const fetchFromRemote = useCallback(() => {
    setLoading(true);
    return Promise.all([
      fetchHmisAppSettings().then(setAppSettings),
      getCurrentUserWithCache().then(setUser),
    ])
      .then(() => setError(undefined))
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  // initial load
  useEffect(() => {
    fetchFromRemote();
  }, [fetchFromRemote]);

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
