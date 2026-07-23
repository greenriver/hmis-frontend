import { Box, Button, Card, Container, Typography } from '@mui/material';

import { getLastConnectorId } from '@/modules/auth/api/storage';
import { useHmisAppSettings } from '@/modules/hmisAppSettings/useHmisAppSettings';

const PublicLanding: React.FC = () => {
  const { logoPath } = useHmisAppSettings();
  const handleSignIn = () => {
    // Get last used connector ID to bypass IDP picker
    const connectorId = getLastConnectorId();
    const signInUrl = connectorId
      ? `/oauth2/sign_in?connector_id=${encodeURIComponent(connectorId)}`
      : '/oauth2/sign_in';
    window.location.href = signInUrl;
  };

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
          {logoPath && (
            <Box
              src={`${window.origin}${logoPath}`}
              component='img'
              sx={{ maxWidth: '100%', mb: 2 }}
            />
          )}
          <Button
            variant='contained'
            color='primary'
            fullWidth
            onClick={handleSignIn}
          >
            Sign In
          </Button>
        </Card>
      </Container>
    </Box>
  );
};

export default PublicLanding;
