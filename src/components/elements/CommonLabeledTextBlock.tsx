import { Box, BoxProps, Typography } from '@mui/material';
import { ReactNode } from 'react';

import NotSpecified from './NotSpecified';

interface CommonCardProps {
  children: string | null | undefined;
  title: ReactNode;
  sx?: BoxProps['sx'];
}

// extracted from ViewCard
export const CommonLabeledTextBlock: React.FC<CommonCardProps> = ({
  title,
  children,
  sx,
}) => (
  <Box sx={sx}>
    <Typography
      component='h6'
      sx={({ typography }) => ({ fontWeight: typography.fontWeightBold })}
    >
      {title}
    </Typography>
    <Box sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>
      {children ? children : <NotSpecified />}
    </Box>
  </Box>
);
