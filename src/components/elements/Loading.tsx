import { Box, BoxProps, CircularProgress } from '@mui/material';

const Loading = ({ sx, ...rest }: BoxProps) => (
  <Box
    display='flex'
    justifyContent='center'
    alignItems='center'
    height='100%'
    data-testid='loading'
    sx={{ p: 10, ...sx }}
    aria-live='polite'
    aria-busy='true'
    {...rest}
  >
    <CircularProgress aria-label='Loading' size={50} />
  </Box>
);

export default Loading;
