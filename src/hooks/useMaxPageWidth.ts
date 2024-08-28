import { useTheme } from '@mui/material/styles';

const useMaxPageWidth = () => {
  const theme = useTheme();
  return theme.breakpoints.values.xl;
};

export default useMaxPageWidth;
