import { Typography } from '@mui/material';
import * as Sentry from '@sentry/react';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import Loading from '@/components/elements/Loading';
import {
  fetchCurrentUser,
  HmisUser,
  logout,
  RELOAD_ONCE_SESSION_KEY,
  sentryUser,
  startImpersonating,
  stopImpersonating,
} from '@/modules/auth/api/sessions';
import * as storage from '@/modules/auth/api/storage';
import { HmisAuthContext, HmisAuthState } from '@/modules/auth/AuthContext';
import LogoutFailedDialog from '@/modules/auth/components/LogoutFailedDialog';
import StopImpersonatingFailedDialog from '@/modules/auth/components/StopImpersonatingFailedDialog';
import { useSessionTrackingObserver } from '@/modules/auth/hooks/useSessionTrackingObserver';
import { fetchHmisAppSettings } from '@/modules/hmisAppSettings/api';
import { HmisAppSettingsContext } from '@/modules/hmisAppSettings/Context';
import { HmisAppSettings } from '@/modules/hmisAppSettings/types';
import { resolveAuthMethod } from '@/modules/hmisAppSettings/useHmisAppSettings';
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
  // Kept separate from `error`: a failed sign-out needs its own copy and its own
  // affordance, and the user stays in the app behind the dialog.
  const [logoutFailed, setLogoutFailed] = useState(false);
  // Same reasoning as `logoutFailed`, for the impersonating branch: the user is
  // still impersonating and stays in the app behind the dialog.
  const [stopImpersonatingFailed, setStopImpersonatingFailed] = useState(false);
  // Tracked separately from `loading` because `loading` unmounts the whole tree
  // (see the render below), which would take the failure dialog and the app
  // behind it with it. Drives the dialog's own spinner instead.
  const [logoutInFlight, setLogoutInFlight] = useState(false);
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

  // `fullPageLoading` is true for the first attempt from the user menu, where we
  // expect to leave the page anyway, and false for a retry from the failure
  // dialog, which has to leave the app mounted behind it.
  const attemptLogout = useCallback(
    async (fullPageLoading: boolean) => {
      // Neither failure flag is cleared here: that would unmount the dialog that
      // launched the retry, so logoutInFlight's spinner would never render. Nothing
      // goes stale -- every exit sets a flag again or leaves the page, and
      // dismissing clears it.
      setLogoutInFlight(true);
      if (fullPageLoading) setLoading(true);

      if (user?.impersonating) {
        try {
          await stopImpersonating();
          reloadWindow();
        } catch (e) {
          // stopImpersonating() rejects on a network error or a non-ok response, and
          // only stores the reverted user on success, so the impersonation is still
          // live here. Reloading would land them back in the app still acting as the
          // other user.
          console.error('Stop impersonating failed', e);
          Sentry.captureException(e, { user: sentryUser(user) });
          setLoading(false);
          setLogoutInFlight(false);
          setStopImpersonatingFailed(true);
        }
        return;
      }

      // Explicit sign-out is the reset point for the remembered IdP connector:
      // forget it so the next sign-in shows the picker. Session *expiry* does not
      // clear it, so routine re-logins stay streamlined. No-op under Devise/Okta.
      storage.clearLastConnectorId();

      let response: Response;
      try {
        response = await logout();
      } catch (e) {
        // Only a failed sign-out reaches here: logout() rejects on a network
        // error or a non-ok response, and nothing else runs inside the try. The
        // session is still live either way, so say so instead of reloading into
        // an app that looks signed in.
        // Users can't diagnose this one themselves, and it leaves a live session
        // on a machine they think they've left. Report it.
        console.error('Sign out failed', e);
        Sentry.captureException(e, { user: sentryUser(user) });
        setLoading(false);
        setLogoutInFlight(false);
        setLogoutFailed(true);
        return;
      }

      // Past this point the server ended the session, so nothing that goes wrong
      // is a failed sign-out. JWT/SSO logout returns JSON with a redirect_url to
      // the IdP end-session endpoint; the Devise/Okta logout may return an empty
      // body, so only parse JSON when the server actually sent it. If the body
      // doesn't parse, fall through to the reload rather than telling the user
      // they're still signed in.
      try {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data: { redirect_url?: string } = await response.json();
          if (data.redirect_url) {
            window.location.href = data.redirect_url;
            return;
          }
        }
      } catch (e) {
        console.error('Could not read the sign-out response', e);
      }
      reloadWindow();
    },
    [user]
  );

  const logoutUser = useCallback(() => {
    attemptLogout(true);
  }, [attemptLogout]);

  const retryLogout = useCallback(() => {
    attemptLogout(false);
  }, [attemptLogout]);

  // A sign-out can fail for a transient reason, and the session it failed to end
  // is still usable, so dismissing and going back to work is a legitimate choice.
  // Sign out is still in the user menu when they're ready to try again.
  const dismissLogoutFailure = useCallback(() => setLogoutFailed(false), []);

  // Dismissing leaves them impersonating, which the "Acting as" banner already
  // announces, and its Exit button is the same retry as this dialog's.
  const dismissStopImpersonatingFailure = useCallback(
    () => setStopImpersonatingFailed(false),
    []
  );

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
        {logoutFailed && (
          <LogoutFailedDialog
            loading={logoutInFlight}
            onRetry={retryLogout}
            onDismiss={dismissLogoutFailure}
            authMethod={resolveAuthMethod(appSettings.authMethod)}
          />
        )}
        {stopImpersonatingFailed && (
          <StopImpersonatingFailedDialog
            loading={logoutInFlight}
            onRetry={retryLogout}
            onDismiss={dismissStopImpersonatingFailure}
            impersonatedUserName={user?.name}
          />
        )}
      </HmisAuthContext.Provider>
    </HmisAppSettingsContext.Provider>
  );
};
