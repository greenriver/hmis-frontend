import { Typography } from '@mui/material';
import * as Sentry from '@sentry/react';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import Loading from '@/components/elements/Loading';
import {
  CurrentUserResult,
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
import { TerminalAccountErrorType } from '@/modules/auth/events';
import { useSessionTrackingObserver } from '@/modules/auth/hooks/useSessionTrackingObserver';
import { fetchHmisAppSettings } from '@/modules/hmisAppSettings/api';
import { HmisAppSettingsContext } from '@/modules/hmisAppSettings/Context';
import { HmisAppSettings } from '@/modules/hmisAppSettings/types';
import { resolveAuthMethod } from '@/modules/hmisAppSettings/useHmisAppSettings';
import { HttpError } from '@/utils/HttpError';
import { reloadWindow } from '@/utils/location';
import { getCurrentSessionId } from '@/utils/sessionId';
import { currentTimeInSeconds } from '@/utils/time';

const TERMINAL_ACCOUNT_ERROR_COPY: Record<
  TerminalAccountErrorType,
  { title: string; message: string }
> = {
  account_deactivated: {
    title: 'Your account has been deactivated',
    message:
      'Your account is no longer active. Please contact your administrator for assistance.',
  },
  no_warehouse_account: {
    title: "You don't have access to this application",
    message:
      'There is no account associated with your sign-in. Please contact your administrator for assistance.',
  },
};

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
  const [logoutFailed, setLogoutFailed] = useState(false);
  const [stopImpersonatingFailed, setStopImpersonatingFailed] = useState(false);
  // Don't drive the retry spinner off `loading`: the render below unmounts the
  // whole tree while `loading` is set, taking the failure dialog with it.
  const [logoutInFlight, setLogoutInFlight] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accountError, setAccountError] = useState<TerminalAccountErrorType>();

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

  const attemptLogout = useCallback(
    async (fullPageLoading: boolean) => {
      // Don't clear logoutFailed / stopImpersonatingFailed here: a retry comes
      // from one of those dialogs, and clearing the flag unmounts the dialog that
      // is meant to show logoutInFlight's spinner. Neither flag goes stale --
      // every path out of this function sets one again, leaves the page, or is
      // dismissed by the user.
      setLogoutInFlight(true);
      if (fullPageLoading) setLoading(true);

      if (user?.impersonating) {
        try {
          await stopImpersonating();
          reloadWindow();
        } catch (e) {
          // stopImpersonating() stores the reverted user only on success, so the
          // impersonation is still live here. Reloading would land the user back
          // in the app still acting as the other user.
          console.error('Stop impersonating failed', e);
          Sentry.captureException(e, { user: sentryUser(user) });
          setLoading(false);
          setLogoutInFlight(false);
          setStopImpersonatingFailed(true);
        }
        return;
      }

      // An explicit sign-out is the only thing that forgets the remembered IdP,
      // so the next sign-in shows the picker again. Session expiry leaves it, so
      // routine re-logins skip the picker.
      storage.clearLastConnectorId();

      let response: Response;
      try {
        response = await logout();
      } catch (e) {
        // Only a failed sign-out reaches here: logout() rejects on a network
        // error or a non-ok response, and nothing else runs inside the try. The
        // session is still live either way, so say so instead of reloading with
        // no sign that the sign-out failed.
        console.error('Sign out failed', e);
        Sentry.captureException(e, { user: sentryUser(user) });
        setLoading(false);
        setLogoutInFlight(false);
        setLogoutFailed(true);
        return;
      }

      // The server ended the session, so nothing that goes wrong below is a
      // failed sign-out: read what we can and reload either way. The 'jwt'
      // logout answers with JSON carrying a redirect_url to the IdP end-session
      // endpoint; the Devise/Okta logout may answer with an empty body.
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
  // Sign out stays in the user menu for a later attempt.
  const dismissLogoutFailure = useCallback(() => setLogoutFailed(false), []);

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
        // Start this fetch before awaiting loadSettings, so the two requests
        // overlap instead of costing two serial round-trips.
        const userPromise: Promise<CurrentUserResult> = cachedUser
          ? Promise.resolve({ user: cachedUser })
          : fetchCurrentUser();

        await loadSettings();

        // accountError does not go through `error`: that dialog offers only a
        // reload, and every reload fetches the same accountError back.
        const { user: fetchedUser, accountError } = await userPromise;
        if (fetchedUser) setUser(fetchedUser);
        else if (accountError) setAccountError(accountError);
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
  if (accountError) {
    const { title, message } = TERMINAL_ACCOUNT_ERROR_COPY[accountError];
    return (
      <>
        <ConfirmationDialog
          open={true}
          confirmText='Sign out'
          title={title}
          loading={logoutInFlight}
          hideCancelButton
          // Not logoutUser: its full-page loading state unmounts this dialog
          // (see logoutInFlight).
          onConfirm={retryLogout}
          maxWidth='sm'
          fullWidth
        >
          <Typography>{message}</Typography>
        </ConfirmationDialog>
        {/* Rendered again here because this branch returns before the signed-in
        tree below, where the other LogoutFailedDialog lives. */}
        {logoutFailed && (
          <LogoutFailedDialog
            loading={logoutInFlight}
            onRetry={retryLogout}
            onDismiss={dismissLogoutFailure}
            authMethod={resolveAuthMethod(appSettings?.authMethod)}
          />
        )}
      </>
    );
  }
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

  // GET /hmis/app_settings is public, so it answers for an unauthenticated
  // JWT/SSO visitor too, and loadSettings has already run by this point.
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
