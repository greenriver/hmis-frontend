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
import { isHmisResponseError } from '../api/sessions';

import Loading from '@/components/elements/Loading';

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
        if (isHmisResponseError(error) && error.type === 'mfa_required') {
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
      .then(() => {
        setUser(undefined);
      })
      .catch((error: Error) => setError(error));
  }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, loading, error, prompt2fa]
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
