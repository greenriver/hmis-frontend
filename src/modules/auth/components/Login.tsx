import { Box, Card, Container, Link, Stack, Typography } from '@mui/material';
import { useState } from 'react';

import OktaLoginForm from './OktaLoginForm';

import LoginForm from '@/modules/auth/components/LoginForm';
import { useHmisAppSettings } from '@/modules/hmisAppSettings/useHmisAppSettings';

const Login: React.FC = () => {
  const { oktaPath, logoPath, warehouseUrl, warehouseName } =
    useHmisAppSettings();
  const [showPwLogin, setShowPwLogin] = useState(!oktaPath);

  return (
    <Box sx={{ backgroundColor: 'background.default', height: '100vh' }}>
      <Container component='main' maxWidth='xs'>
        <Box sx={{ pt: 4 }}>
          <Typography variant='h5' fontWeight={600} textAlign='center'>
            OPEN PATH{' '}
            <Box display='inline' color='text.secondary' component='span'>
              HMIS
            </Box>
          </Typography>
        </Box>
        <Card
          sx={{
            mt: 10,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: (theme) => theme.shadows[2],
          }}
        >
          {logoPath && (
            <Box
              src={`${window.origin}${logoPath}`}
              component='img'
              sx={{ maxWidth: '100%', mb: 2 }}
            />
          )}
          {oktaPath && !showPwLogin && (
            <Box sx={{ width: '100%' }}>
              <OktaLoginForm path={oktaPath} />
            </Box>
          )}
          {showPwLogin && <LoginForm />}
        </Card>

        <Stack
          justifyContent={'space-evenly'}
          sx={{ mt: 14, mb: 2 }}
          direction='row'
          gap={3}
        >
          {warehouseUrl && (
            <Link href={warehouseUrl} color='text.secondary'>
              {warehouseName || 'Open Path Warehouse'}
            </Link>
          )}
          {oktaPath && !showPwLogin && (
            <Link
              component='button'
              color='text.secondary'
              onClick={() => setShowPwLogin(true)}
            >
              Login with Password
            </Link>
          )}
          {oktaPath && showPwLogin && (
            <Link
              component='button'
              color='text.secondary'
              onClick={() => setShowPwLogin(false)}
            >
              Login with Okta
            </Link>
          )}
        </Stack>
      </Container>
    </Box>
  );
};

export default Login;
