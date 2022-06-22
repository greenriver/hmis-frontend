import { Box, Button, Alert, TextField } from '@mui/material';
import React, { FormEvent, useState } from 'react';

import OneTimePassword from './OneTimePassword';

import useAuth from '@/modules/auth/hooks/useAuth';

const LoginForm = () => {
  const { login, prompt2fa, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  if (error) console.log(`Error in login: ${error.message}`);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    login({ email, password });
  }

  if (prompt2fa) return <OneTimePassword />;

  return (
    <Box component='form' onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      <TextField
        margin='normal'
        required
        fullWidth
        id='email'
        label='Email Address'
        name='email'
        autoComplete='email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        margin='normal'
        required
        fullWidth
        name='password'
        label='Password'
        type='password'
        id='password'
        autoComplete='current-password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button
        type='submit'
        variant='contained'
        color='primary'
        fullWidth
        sx={{ mt: 3, mb: 2 }}
        disabled={loading}
      >
        Sign In
      </Button>
      {/* FIXME: error could be something else */}
      {error && <Alert severity='error'>Bad login/password</Alert>}
    </Box>
  );
};

export default LoginForm;
