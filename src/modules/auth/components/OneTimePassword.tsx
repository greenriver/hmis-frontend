import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import React, { useState } from 'react';

import useAuth from '@/modules/auth/hooks/useAuth';

export default function OneTimePassword() {
  const [otpAttempt, setOtpAttempt] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { login, loading, error } = useAuth();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    login({ otpAttempt: otpAttempt });
  }

  return (
    <Container component='main' maxWidth='xs'>
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box component='form' onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            id='otpAttempt'
            label='Verification code'
            fullWidth
            value={otpAttempt}
            onChange={(e) => setOtpAttempt(e.target.value)}
          />
          <Button
            type='submit'
            variant='contained'
            color='primary'
            fullWidth
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            Confirm
          </Button>
          {/* FIXME: error could be something else */}
          {error && <Alert severity='error'>Invalid verification code</Alert>}
        </Box>
      </Box>
    </Container>
  );
}
