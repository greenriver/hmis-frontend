import { Box, Button, Card, Container, Typography } from '@mui/material';

import { getLastConnectorId } from '@/modules/auth/api/storage';
import { useHmisAppSettings } from '@/modules/hmisAppSettings/useHmisAppSettings';

const PublicLanding: React.FC = () => {
  const { logoPath } = useHmisAppSettings() || {};
  const logoSrc = logoPath || '/logo/hmis_logo';
  const handleSignIn = () => {
    // Get last used connector ID to bypass IDP picker
    const connectorId = getLastConnectorId();
    const signInUrl = connectorId
      ? `/oauth2/sign_in?connector_id=${encodeURIComponent(connectorId)}`
      : '/oauth2/sign_in';
    window.location.href = signInUrl;
  };

  return (
    <Box
      sx={{ backgroundColor: 'background.default', minHeight: '100vh', py: 8 }}
    >
      <Container component='main' maxWidth='md'>
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
          <Box
            src={`${window.origin}${logoSrc}`}
            component='img'
            sx={{ maxWidth: '100%', mb: 2 }}
          />

          <Button
            variant='contained'
            size='large'
            onClick={handleSignIn}
            sx={{
              px: 6,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
            }}
          >
            Sign In
          </Button>
        </Card>
      </Container>
    </Box>
  );
};

export default PublicLanding;
