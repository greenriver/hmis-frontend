import { Typography, TypographyProps } from '@mui/material';
import { styled } from '@mui/material/styles';

const MultilineTypography = styled(Typography)<TypographyProps>(() => ({
  whiteSpace: 'pre-line',
  overflowWrap: 'break-word',
}));

export default MultilineTypography;
