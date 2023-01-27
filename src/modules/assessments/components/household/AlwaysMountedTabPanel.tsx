import { Box, BoxProps } from '@mui/material';

const AlwaysMountedTabPanel = ({
  sx,
  children,
  active,
  ...props
}: BoxProps & { active: boolean }) => (
  <Box
    role='tabpanel'
    {...props}
    sx={{ ...sx, display: active ? undefined : 'none' }}
  >
    {children}
  </Box>
);
export default AlwaysMountedTabPanel;
