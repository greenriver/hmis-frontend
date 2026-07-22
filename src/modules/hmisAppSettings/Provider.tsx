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
  const [appSettings, setAppSettings] = useState<HmisAppSettings>();
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
      return stopImpersonating()
        .then(() => {
          reloadWindow();
        })
        .catch((e) => {
          setLoading(false);
          setError(e);
        });
    } else {
      // Explicit sign-out is the reset point for the remembered IdP connector:
      // forget it so the next sign-in shows the picker. Session *expiry* does not
      // clear it, so routine re-logins stay streamlined. No-op under Devise/Okta.
      storage.clearLastConnectorId();
      // JWT/SSO logout returns JSON with a redirect_url to the IdP end-session
      // endpoint. The Devise/Okta logout may return an empty body, so only parse
      // JSON when the server actually sent it; otherwise just reload as before.
      return logout()
        .then(async (response) => {
          if (response.ok) {
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
              const data: { redirect_url?: string } = await response.json();
              if (data.redirect_url) {
                window.location.href = data.redirect_url;
                return;
              }
            }
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

    const loadSettings = async (): Promise<HmisAppSettings> => {
      const cached = cachedUser ? storage.getAppSettings() : undefined;
      const settings = cached ?? (await fetchHmisAppSettings());
      setAppSettings(settings);
      if (!cached) storage.setAppSettings(settings);
      await prefetchLogo(settings.logoPath);
      return settings;
    };

    (async () => {
      try {
        // Kick the currentUser fetch off alongside settings so we don't add a round-trip.
        const userPromise: Promise<HmisUser | undefined> = cachedUser
          ? Promise.resolve(cachedUser)
          : fetchCurrentUser();

        await loadSettings();

        const fetchedUser = await userPromise;
        if (fetchedUser) setUser(fetchedUser);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    })();
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

  // app_settings is public and has loaded by now in both auth modes (an
  // unauthenticated JWT/SSO user still gets settings), so it's always present here.
  if (!appSettings) throw new Error(); // shouldn't get here
  return (
    <HmisAppSettingsContext.Provider value={appSettings}>
      <HmisAuthContext.Provider value={authState}>
        {children}
      </HmisAuthContext.Provider>
    </HmisAppSettingsContext.Provider>
  );
};
