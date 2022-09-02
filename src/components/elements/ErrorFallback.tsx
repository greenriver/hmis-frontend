import { Box, Typography, Button } from '@mui/material';

const ErrorFallback = () => (
  <Box
    display='flex'
    justifyContent='center'
    alignItems='center'
    height='100%'
    data-testid='error'
    flexDirection='column'
    sx={{ p: 10 }}
  >
    <Typography variant='h4'>Something went wrong.</Typography>
    <Button
      variant='outlined'
      onClick={() => window.location.reload()}
      sx={{ mt: 3 }}
    >
      Refresh
    </Button>
  </Box>
);

export default ErrorFallback;
