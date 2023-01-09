import { Breakpoint, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export const useIsMobile = (breakpoint: Breakpoint = 'md') => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down(breakpoint));
};
