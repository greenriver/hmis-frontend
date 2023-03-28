import { Box, Button, Container } from '@mui/material';
import { useState } from 'react';

import OktaLoginForm from './OktaLoginForm';

import LoginForm from '@/modules/auth/components/LoginForm';
import { useHmisAppSettings } from '@/modules/hmisAppSettings/hooks';

const Login: React.FC = () => {
  const { oktaPath } = useHmisAppSettings();
  const [showPwLogin, setShowPwLogin] = useState(!oktaPath);
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
        {oktaPath && <OktaLoginForm path={oktaPath} />}
        {showPwLogin && <LoginForm />}
        {!showPwLogin && (
          <Button
            sx={{ my: 3 }}
            variant='text'
            onClick={() => setShowPwLogin(true)}
          >
            Login with Password
          </Button>
        )}
      </Box>
    </Container>
  );
};

export default Login;
