import { Alert, Box, Link } from '@mui/material';
import {
  FormEvent,
  KeyboardEventHandler,
  useCallback,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';

import OneTimePassword from './OneTimePassword';

import TextInput from '@/components/elements/input/TextInput';
import LoadingButton from '@/components/elements/LoadingButton';
import {
  fetchCurrentUser,
  HmisUser,
  isHmisResponseError,
  login,
} from '@/modules/auth/api/sessions';
import useAuth from '@/modules/auth/hooks/useAuth';
import { useHmisAppSettings } from '@/modules/hmisAppSettings/useHmisAppSettings';
import { reloadWindow } from '@/utils/location';

const errorMessage = (error: Error) => {
  if (isHmisResponseError(error)) {
    return error.type === 'unauthenticated'
      ? 'Incorrect email or password.'
      : error.message;
  }
  return 'Something went wrong, please try again later.';
};

const LoginForm = () => {
  const [error, setError] = useState<Error>();
  const [requiredFieldsError, setRequiredFieldsError] =
    useState<boolean>(false);
  const [prompt2fa, setPrompt2fa] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { setUser } = useAuth();
  const { resetPasswordUrl } = useHmisAppSettings();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSuccess = useCallback(
    (user: HmisUser) => {
      setUser(user);
      navigate('/');
    },
    [navigate, setUser]
  );

  const retryCsrf = useRef(true);
  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement | HTMLDivElement>) => {
      event.preventDefault();
      if (!email || !password) {
        setRequiredFieldsError(true);
        return;
      }
      setRequiredFieldsError(false);
      setError(undefined);
      setLoading(true);

      const sendLogin = () => {
        // if (simulateFail) return Promise.reject( new HmisResponseError({ type: 'unverified_request' }));
        return login({ email, password }).then((user) => {
          setPrompt2fa(false);
          setLoading(false);
          handleSuccess(user);
        });
      };

      const handleHmisError = (error: any): boolean => {
        if (!isHmisResponseError(error)) return false;

        if (error.type === 'mfa_required') {
          setError(undefined);
          setPrompt2fa(true);
          setLoading(false);
          return true;
        } else if (error.type === 'unverified_request' && retryCsrf.current) {
          // fetch the current user to get a new csrf cookie
          retryCsrf.current = false;
          fetchCurrentUser()
            .then((currentUser) => {
              if (currentUser) return reloadWindow(); // already logged in

              // retry the login
              sendLogin().catch((error: any) => {
                if (!handleHmisError(error)) {
                  setError(error);
                  setLoading(false);
                }
              });
            })
            .catch((error) => {
              setError(error);
              setLoading(false);
            });
          return true;
        }
        return false;
      };

      return sendLogin().catch((error: any) => {
        if (!handleHmisError(error)) {
          setError(error);
          setLoading(false);
        }
      });
    },
    [handleSuccess, email, password]
  );

  const onKeyDown: KeyboardEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit(e);
      }
    },
    [handleSubmit]
  );

  if (prompt2fa) return <OneTimePassword onSuccess={handleSuccess} />;

  return (
    <Box component='form' onSubmit={handleSubmit} noValidate>
      <TextInput
        margin='normal'
        required
        fullWidth
        label='Email Address'
        name='email'
        autoComplete='email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder='ex. name@email.com'
        sx={{ '.MuiFormLabel-asterisk': { display: 'none' } }}
        {...(requiredFieldsError && !email
          ? { error: true, helperText: 'Please enter email' }
          : undefined)}
      />
      <TextInput
        margin='normal'
        required
        fullWidth
        name='password'
        label='Password'
        type='password'
        placeholder='Password'
        autoComplete='current-password'
        value={password}
        onKeyDown={onKeyDown}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ '.MuiFormLabel-asterisk': { display: 'none' } }}
        {...(requiredFieldsError && !password
          ? { error: true, helperText: 'Please enter password' }
          : undefined)}
      />

      <LoadingButton
        type='submit'
        variant='contained'
        color='primary'
        fullWidth
        sx={{ mt: 3, mb: 2 }}
        loading={loading}
      >
        Sign In
      </LoadingButton>
      {error && <Alert severity='error'>{errorMessage(error)}</Alert>}
      {resetPasswordUrl && (
        <Box
          sx={{ width: '100%', display: 'flex', mt: 2, justifyContent: 'end' }}
        >
          <Link href={resetPasswordUrl}>Forgot password?</Link>
        </Box>
      )}
    </Box>
  );
};

export default LoginForm;
