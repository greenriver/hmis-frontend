import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import React, { FormEvent, useCallback, useState } from 'react';

import { HmisUser, isHmisResponseError, login } from '../api/sessions';

import {
  dispatchAccountErrorEvent,
  isTerminalAccountErrorType,
} from '@/modules/auth/events';

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
          setLoading(false);
          // The backend can refuse HMIS access after a valid code; that is not a
          // code problem, so hand it to the terminal page instead of this form.
          if (
            isHmisResponseError(error) &&
            isTerminalAccountErrorType(error.type)
          ) {
            dispatchAccountErrorEvent(error.type);
            return;
          }
          setError(error);
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
