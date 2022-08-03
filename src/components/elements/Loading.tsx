import { Box, CircularProgress } from '@mui/material';

const Loading = () => (
  <Box
    display='flex'
    justifyContent='center'
    alignItems='center'
    height='100%'
    data-testid='loading'
    sx={{ p: 10 }}
  >
    <CircularProgress size={50} />
  </Box>
);

export default Loading;
