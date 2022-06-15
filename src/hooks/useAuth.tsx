import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import * as sessionsApi from '../api/sessions';

interface AuthContextType {
  user?: HmisUser;
  loading: boolean;
  prompt2fa: boolean;
  error?: Error;
  login: (params: sessionsApi.LoginParams) => void;
  logout: () => void;
}

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

  const navigateTo = useNavigate();
  const location = useLocation();

  // Reset error state on page change
  useEffect(() => {
    if (error) setError(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Check if there is a currently active session when the provider is mounted for the first time
  useEffect(() => {
    sessionsApi
      .getCurrentUser()
      .then((user) => setUser(user))
      .catch(() => {})
      .finally(() => setLoadingInitial(false));
  }, []);

  function login(params: sessionsApi.LoginParams) {
    setLoading(true);
    sessionsApi
      .login(params)
      .then((user) => {
        setUser(user);
        setPrompt2fa(false);
        navigateTo('/');
      })
      .catch((error: Error) => {
        if (error.message === 'mfa_required') {
          setPrompt2fa(true);
        } else {
          setError(error);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function logout() {
    sessionsApi
      .logout()
      .then(() => setUser(undefined))
      .catch((error: Error) => setError(error));
  }

  // Make the provider update only when it should.
  // We only want to force re-renders if the user,
  // loading or error states change.
  //
  // Whenever the `value` passed into a provider changes,
  // the whole tree under the provider re-renders, and
  // that can be very costly! Even in this case, where
  // you only get re-renders when logging in and out
  // we want to keep things very performant.
  const memoedValue = useMemo(
    () => ({
      user,
      loading,
      error,
      prompt2fa,
      login,
      logout,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, loading, error, prompt2fa]
  );

  return (
    <AuthContext.Provider value={memoedValue}>
      {loadingInitial && <div>Loading...</div>}
      {!loadingInitial && children}
    </AuthContext.Provider>
  );
}

export default function useAuth() {
  return useContext(AuthContext);
}
