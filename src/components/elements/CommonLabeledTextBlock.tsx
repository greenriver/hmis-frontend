import { Box, TypographyProps, Typography } from '@mui/material';
import { ReactNode } from 'react';

import NotSpecified from './NotSpecified';

interface Props {
  children: string | null | undefined;
  title: ReactNode;
  sx?: TypographyProps['sx'];
  variant?: TypographyProps['variant'];
}

export const CommonLabeledTextBlock: React.FC<Props> = ({
  title,
  children,
  variant = 'body2',
  sx,
}) => (
  <Typography sx={sx} variant={variant} component='div'>
    <Box sx={({ typography }) => ({ fontWeight: typography.fontWeightBold })}>
      {title}
    </Box>
    <Box sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>
      {children ? children : <NotSpecified />}
    </Box>
  </Typography>
);
