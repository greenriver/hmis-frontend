import { Box, CircularProgress } from '@mui/material';

const Loading = () => (
  <Box
    display='flex'
    justifyContent='center'
    alignItems='center'
    minHeight='100vh'
    data-testid='loading'
  >
    <CircularProgress size={50} />
  </Box>
);

export default Loading;
