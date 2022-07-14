import { Box, Typography, Button } from '@mui/material';

const ErrorFallback = () => (
  <Box
    display='flex'
    justifyContent='center'
    alignItems='center'
    minHeight='100vh'
    data-testid='error'
    flexDirection='column'
  >
    <Typography variant='h4'>Something went wrong.</Typography>
    <Button
      variant='outlined'
      onClick={() => window.location.assign(window.location.origin)}
      sx={{ mt: 3 }}
    >
      Refresh
    </Button>
  </Box>
);

export default ErrorFallback;
