import { Box, BoxProps } from '@mui/material';

const CodeTextBlock: React.FC<BoxProps> = ({ children, sx, ...props }) => (
  <Box
    component='pre'
    {...props}
    sx={{
      fontFamily: 'monospace',
      fontSize: 'small',
      backgroundColor: 'grayscale.50',
      borderRadius: '4px',
      maxWidth: '100%',
      width: '100%',
      overflowX: 'auto',
      p: 1.5,
      m: 0,
      whiteSpace: 'pre',
      ...sx,
    }}
  >
    {children}
  </Box>
);

export default CodeTextBlock;
