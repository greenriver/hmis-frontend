import { Typography } from '@mui/material';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import Loading from '@/components/elements/Loading';
import {
  fetchCurrentUser,
  HmisUser,
  logout,
  RELOAD_ONCE_SESSION_KEY,
  startImpersonating,
  stopImpersonating,
} from '@/modules/auth/api/sessions';
import * as storage from '@/modules/auth/api/storage';
import { HmisAuthContext, HmisAuthState } from '@/modules/auth/AuthContext';
import { useSessionTrackingObserver } from '@/modules/auth/hooks/useSessionTrackingObserver';
import { fetchHmisAppSettings } from '@/modules/hmisAppSettings/api';
import { HmisAppSettingsContext } from '@/modules/hmisAppSettings/Context';
import { HmisAppSettings } from '@/modules/hmisAppSettings/types';
import { HttpError } from '@/utils/HttpError';
import { reloadWindow } from '@/utils/location';
import { getCurrentSessionId } from '@/utils/sessionId';
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
  const [appSettings, setAppSettings] = useState<HmisAppSettings | null>(null);
  const [user, setUser] = useState<HmisUser>();
  const [error, setError] = useState<Error | HttpError>();
  const [loading, setLoading] = useState(true);

  // clear stale localStorage if session has changed
  useEffect(() => {
    const currentSessionId = getCurrentSessionId();
    const lastSessionId = storage.getLastSessionId();
    if (currentSessionId !== lastSessionId) {
      console.warn('Clearing session due to ID mismatch', {
        currentSessionId,
        lastSessionId,
      });
      storage.setLastSessionId(currentSessionId);
      storage.clearUser();
      storage.clearAppSettings();
      storage.clearSessionTacking();
    }
  }, []);

  const logoutUser = useCallback(() => {
    setLoading(true);
    if (user?.impersonating) {
      // Stop impersonating returns HmisUser
      return stopImpersonating()
        .then(() => {
          reloadWindow();
        })
        .catch((e) => {
          setLoading(false);
          setError(e);
        });
    } else {
      // Logout returns Response with redirect_url
      return logout()
        .then((response) => {
          if (response.ok) {
            return response.json().then((data: { redirect_url?: string }) => {
              if (data.redirect_url) {
                window.location.href = data.redirect_url;
              } else {
                reloadWindow();
              }
            });
          }
          reloadWindow();
        })
        .catch((e) => {
          setLoading(false);
          setError(e);
        });
    }
  }, [user?.impersonating]);

  const impersonateUser = useCallback((userId: string) => {
    setLoading(true);
    return startImpersonating(userId)
      .then(() => {
        window.location.assign('/');
      })
      .catch((e) => {
        setLoading(false);
        setError(e);
      });
  }, []);

  // auth state for global context
  const authState = useMemo<HmisAuthState>(
    () => ({
      user: user,
      setUser,
      logoutUser,
      impersonateUser,
    }),
    [user, logoutUser, impersonateUser]
  );

  // tracking needs to be in place before we start making API calls
  useSessionTrackingObserver();

  // fetch data from remote
  useEffect(() => {
    const cachedUser = getValidCachedUser();
    const promises: Array<Promise<any>> = [];

    // Pre-warm the backend cache with the logo image
    const prefetchLogo = (logoPath?: string) => {
      if (!logoPath) return Promise.resolve();
      const src = `${window.origin}${logoPath}`;
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = src;
      });
    };

    const saveSettings = (value: HmisAppSettings): Promise<void> => {
      setAppSettings(value);
      storage.setAppSettings(value);
      return prefetchLogo(value.logoPath);
    };

    if (cachedUser) {
      // We have a cached user, try to load settings
      setUser(cachedUser);
      const cachedAppSettings = storage.getAppSettings();
      if (cachedAppSettings) {
        setAppSettings(cachedAppSettings);
        promises.push(prefetchLogo(cachedAppSettings.logoPath));
      } else {
        promises.push(fetchHmisAppSettings().then(saveSettings));
      }
    } else {
      // No cached user - attempt to fetch user to check if authenticated
      // If successful, user is authenticated. If 401, show public landing page.
      promises.push(
        fetchCurrentUser()
          .then((user) => {
            setUser(user);
            // Also fetch app settings after successful user fetch
            return fetchHmisAppSettings().then(saveSettings);
          })
          .catch((err) => {
            if (err?.status === 401) {
              // Not authenticated - this is expected for public landing page
              console.info(
                'User not authenticated, showing public landing page'
              );
            } else {
              // Real error - throw it
              throw err;
            }
          })
      );
    }

    if (promises.length) {
      Promise.all(promises)
        .catch((err) => {
          // Only set error for non-401 errors
          setError(err);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // handle side-effects
  useEffect(() => {
    if (appSettings?.appName) document.title = appSettings.appName;
  }, [appSettings?.appName]);

  useEffect(() => {
    if (
      error instanceof HttpError &&
      error.status === 401 &&
      !sessionStorage.getItem(RELOAD_ONCE_SESSION_KEY)
    ) {
      sessionStorage.setItem(RELOAD_ONCE_SESSION_KEY, 'true');
      setLoading(true);
      reloadWindow();
    }
  }, [error]);

  const handleManualReload = useCallback(() => {
    setLoading(true);
    reloadWindow();
  }, []);

  if (loading) return <Loading />;
  if (error) {
    return (
      <ConfirmationDialog
        open={true}
        confirmText='Try again'
        title='An error occurred'
        loading={loading}
        hideCancelButton
        onConfirm={handleManualReload}
      >
        <Typography>Failed to connect to the server.</Typography>
      </ConfirmationDialog>
    );
  }

  // Allow null appSettings for public/unauthenticated pages
  return (
    <HmisAppSettingsContext.Provider value={appSettings}>
      <HmisAuthContext.Provider value={authState}>
        {children}
      </HmisAuthContext.Provider>
    </HmisAppSettingsContext.Provider>
  );
};
