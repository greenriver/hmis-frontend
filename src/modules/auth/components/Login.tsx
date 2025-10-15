import {
  Box,
  Card,
  Container,
  Link,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';

import OktaLoginForm from './OktaLoginForm';

import LoginForm from '@/modules/auth/components/LoginForm';
import { useHmisAppSettings } from '@/modules/hmisAppSettings/useHmisAppSettings';
import Loading from '@/components/elements/Loading';

const Login: React.FC = () => {
  const { oktaPath, logoPath, warehouseUrl, warehouseName } =
    useHmisAppSettings();
  const [showPwLogin, setShowPwLogin] = useState(!oktaPath);
  const [logoLoaded, setLogoLoaded] = useState(!logoPath); // If no logo, consider it loaded

  const logo = useMemo(() => {
    if (!logoPath) return null;
    
    return <img
      // Note that this image must always be rendered, even if logoLoaded is false,
      // otherwise the onLoad callback won't get called and logoLoaded would never become true.
      src={`${window.origin}${logoPath}`}
      onLoad={() => setLogoLoaded(true)}
      onError={() => setLogoLoaded(true)}
      // component='img'
      // sx={{
      //   maxWidth: '100%',
      //   mb: 2,
      //   // display: logoLoaded ? 'block' : 'none',
      // }}
    />
  }, [logoPath, logoLoaded]);
  console.log(logoLoaded);

  if (!logoLoaded) return <><Loading />{logo}</>;

  return (
    <Box sx={{ backgroundColor: 'background.default', height: '100vh' }}>
      <Container component='main' maxWidth='xs'>
        <Box sx={{ pt: { md: 4, xs: 2 } }}>
          <Typography
            component='h1'
            variant='h5'
            fontWeight={600}
            textAlign='center'
          >
            OPEN PATH{' '}
            <Box display='inline' color='text.secondary' component='span'>
              HMIS
            </Box>
          </Typography>
        </Box>
        <Card
          sx={{
            mt: { lg: 10, md: 8, xs: 4 },
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: (theme) => theme.shadows[2],
          }}
        >
          {!logoLoaded && <Loading/>}
          {logo}
          {oktaPath && !showPwLogin && (
            <Box sx={{ width: '100%' }}>
              <OktaLoginForm path={oktaPath} />
            </Box>
          )}
          {showPwLogin && <LoginForm />}
        </Card>

        <Stack
          justifyContent={'space-evenly'}
          sx={{ mt: { lg: 14, md: 6, xs: 4 }, mb: 2 }}
          direction='row'
          gap={3}
        >
          {warehouseUrl && (
            <Link href={warehouseUrl}>
              {warehouseName || 'Open Path Warehouse'}
            </Link>
          )}
          {oktaPath && !showPwLogin && (
            <Link component='button' onClick={() => setShowPwLogin(true)}>
              Login with Password
            </Link>
          )}
          {oktaPath && showPwLogin && (
            <Link component='button' onClick={() => setShowPwLogin(false)}>
              Login with Okta
            </Link>
          )}
        </Stack>
      </Container>
    </Box>
  );
};

export default Login;
