import { Box, Button, Card, Container, Stack, Typography } from '@mui/material';

const PublicLanding: React.FC = () => {
  const handleSignIn = () => {
    // Redirect to oauth2-proxy sign-in, which will redirect to Dex IdP picker
    window.location.href = '/oauth2/sign_in';
  };

  return (
    <Box
      sx={{ backgroundColor: 'background.default', minHeight: '100vh', py: 8 }}
    >
      <Container component='main' maxWidth='md'>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography component='h1' variant='h2' fontWeight={700} gutterBottom>
            OPEN PATH{' '}
            <Box display='inline' color='primary.main' component='span'>
              HMIS
            </Box>
          </Typography>
          <Typography variant='h5' color='text.secondary' sx={{ mt: 2 }}>
            Homeless Management Information System
          </Typography>
        </Box>

        <Card
          sx={{
            p: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: (theme) => theme.shadows[3],
          }}
        >
          <Typography variant='h4' gutterBottom fontWeight={600}>
            Welcome
          </Typography>
          <Typography
            variant='body1'
            color='text.secondary'
            sx={{ mb: 4, textAlign: 'center', maxWidth: '500px' }}
          >
            Sign in to access client records, manage enrollments, and coordinate
            services across your organization.
          </Typography>

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

          <Stack
            direction='row'
            spacing={2}
            sx={{
              mt: 4,
              pt: 4,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant='body2' color='text.secondary'>
              Need help?
            </Typography>
            <Typography variant='body2'>
              Contact your system administrator
            </Typography>
          </Stack>
        </Card>
      </Container>
    </Box>
  );
};

export default PublicLanding;
