import { LoadingButton } from '@mui/lab';
import { Alert, Box } from '@mui/material';
import { FormEvent, KeyboardEventHandler, useCallback, useState } from 'react';

import { isHmisResponseError } from '../api/sessions';

import OneTimePassword from './OneTimePassword';

import TextInput from '@/components/elements/input/TextInput';
import useAuth from '@/modules/auth/hooks/useAuth';

const errorMessage = (error: Error) => {
  if (isHmisResponseError(error)) {
    return error.type === 'unauthenticated'
      ? 'Bad login/password'
      : error.message;
  }
  return 'Something went wrong, please try again later.';
};

const LoginForm = () => {
  const { login, prompt2fa, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  if (error) console.error(`Error logging in: ${error.message}`);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement | HTMLDivElement>) => {
      event.preventDefault();
      login({ email, password });
    },
    [email, login, password]
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

  if (prompt2fa) return <OneTimePassword />;

  return (
    <Box component='form' onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      <TextInput
        margin='normal'
        required
        fullWidth
        label='Email Address'
        name='email'
        autoComplete='email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextInput
        margin='normal'
        required
        fullWidth
        name='password'
        label='Password'
        type='password'
        autoComplete='current-password'
        value={password}
        onKeyDown={onKeyDown}
        onChange={(e) => setPassword(e.target.value)}
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
    </Box>
  );
};

export default LoginForm;
