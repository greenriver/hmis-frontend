import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import React, { FormEvent, useCallback, useState } from 'react';

import { HmisUser, login } from '../api/sessions';

interface Props {
  onSuccess: (user: HmisUser) => void;
}
const OneTimePassword: React.FC<Props> = ({ onSuccess }) => {
  const [error, setError] = useState<Error>();
  const [otpAttempt, setOtpAttempt] = useState('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement | HTMLDivElement>) => {
      event.preventDefault();
      setLoading(true);
      login({ otpAttempt: otpAttempt })
        .then((user) => onSuccess(user))
        .catch((error: Error) => {
          setError(error);
          setLoading(false);
        });
    },
    [onSuccess, otpAttempt]
  );

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
};
export default OneTimePassword;
