import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import * as sessionsApi from '../api/sessions';
import { HmisUser, isHmisResponseError } from '../api/sessions';
import { USER_STORAGE_KEY } from '../api/storage';

import Loading from '@/components/elements/Loading';
import { useInterval } from '@/hooks/useInterval';

interface AuthContextType {
  user?: HmisUser;
  loading: boolean;
  prompt2fa: boolean;
  error?: Error;
  login: (params: sessionsApi.LoginParams) => void;
  logout: (clearPreviousPage?: boolean) => void;
}

export type RouteLocationState = {
  /** Previous pathname, so we can redirect to it when logging back in */
  prev?: string;
  /** Whether to clear/ignore the previous pathname. For example when someone clicks "Sign Out," the previous location shouldn't be maintained when they log back in.  */
  clearPrev?: boolean;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Export the provider as we need to wrap the entire app with it
export function AuthProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [user, setUser] = useState<HmisUser>();
  const [error, setError] = useState<Error>();
  const [prompt2fa, setPrompt2fa] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);

  const navigate = useNavigate();
  const { state, pathname } = useLocation();

  const login = useCallback(
    (params: sessionsApi.LoginParams) => {
      setLoading(true);

      sessionsApi
        .login(params)
        .then((user) => {
          setUser(user);
          setPrompt2fa(false);
          navigate((state as RouteLocationState)?.prev || '/');
          setLoading(false);
        })
        .catch((error: Error) => {
          if (isHmisResponseError(error) && error.type === 'mfa_required') {
            setPrompt2fa(true);
            setLoading(false);
          } else if (
            isHmisResponseError(error) &&
            error.type === 'unverified_request'
          ) {
            console.log('CSRF token is expired, fetching a new one...');
            return sessionsApi
              .fetchCurrentUser()
              .catch(() => {})
              .then(() => login(params));
          } else {
            setError(error);
            setLoading(false);
          }
        });
    },
    [setLoading, navigate, state]
  );

  const logout = useCallback(
    (clearPreviousPage = false) => {
      if (clearPreviousPage) {
        // Add "clearPrev" to state. This is used when someone clicks "Sign Out,"
        // because the previous location shouldn't be maintained when they log back in.
        navigate(pathname, {
          state: { clearPrev: true },
          replace: true,
        });
      }
      setLoading(true);
      return sessionsApi
        .logout()
        .then(() => {
          // get a new CSRF token
          return sessionsApi.fetchCurrentUser();
        })
        .finally(() => {
          setUser(undefined);
          setLoading(false);
        });
    },
    [navigate, pathname]
  );

  // Poll the backend to check if the session is still valid
  useInterval(() => {
    if (!user) return; // if not logged in, no need to poll
    sessionsApi
      .fetchCurrentUser()
      .then((fetchedUser) => {
        if (fetchedUser.email != user.email) {
          console.log(
            "Invalid session (user doesn't match storage), logging out"
          );
          logout();
        }
      })
      .catch((statusCode) => {
        // Only logout if it was an auth failure. We shouldn't log out on 504.
        if (statusCode === 401) {
          console.log('Invalid session, logging out');
          logout();
        }
      });
  }, 30 * 1000); // 30 seconds

  // If user info disappears from storage, log them out.
  // This happens when they sign out from a different tab.
  useEffect(() => {
    const handleSessionEnded = (e: StorageEvent) => {
      if (e.key === USER_STORAGE_KEY && e.oldValue && !e.newValue) {
        console.log('Invalid session (user missing from storage), logging out');
        logout();
      }
    };
    window.addEventListener('storage', handleSessionEnded);
    return function cleanup() {
      window.removeEventListener('storage', handleSessionEnded);
    };
  }, [logout]);

  // Reset error state on page change
  useEffect(() => {
    if (error) setError(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Check if there is a currently active session when the provider is mounted for the first time
  useEffect(() => {
    sessionsApi
      // Fetch session from backend on page load.
      // We could call "getCurrentUser" (looks in local storage) to speed
      // things up, but it would result in a flashing screen before logout
      // if the user session has already expired.
      .fetchCurrentUser()
      .then((user) => setUser(user))
      .catch(() => {})
      .finally(() => setLoadingInitial(false));
  }, []);

  // Make the provider update only when it should
  const memoedValue = useMemo(
    () => ({
      user,
      loading,
      error,
      prompt2fa,
      login,
      logout,
    }),
    [user, loading, error, prompt2fa, login, logout]
  );

  return (
    <AuthContext.Provider value={memoedValue}>
      {loadingInitial && <Loading />}
      {!loadingInitial && children}
    </AuthContext.Provider>
  );
}

export default function useAuth() {
  return useContext(AuthContext);
}
