import { Box, Typography, TypographyProps } from '@mui/material';
import { ReactNode } from 'react';

import NotCollectedText from '@/modules/form/components/viewable/item/NotCollectedText';

interface Props {
  children: ReactNode | string | null | undefined;
  title: ReactNode;
  sx?: TypographyProps['sx'];
  variant?: TypographyProps['variant'];
  horizontal?: boolean;
}

export const CommonLabeledTextBlock: React.FC<Props> = ({
  title,
  children,
  variant = 'body2',
  sx,
  horizontal = false,
}) => (
  <Typography
    sx={{
      display: horizontal ? 'flex' : undefined,
      gap: horizontal ? 1 : undefined,
      ...sx,
    }}
    variant={variant}
    component='div'
  >
    <Box sx={({ typography }) => ({ fontWeight: typography.fontWeightBold })}>
      {title}
    </Box>
    <Box sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>
      {children ? children : <NotCollectedText variant={variant} />}
    </Box>
  </Typography>
);
