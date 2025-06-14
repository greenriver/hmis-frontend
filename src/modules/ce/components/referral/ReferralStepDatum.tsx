import { SvgIconComponent } from '@mui/icons-material';
import { Box, SxProps, Typography } from '@mui/material';
import React, { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';

// Component for common styles in the info text for steps
const ReferralStepDatum: React.FC<{
  children: ReactNode;
  sx?: SxProps;
  Icon?: SvgIconComponent;
}> = ({ children, sx, Icon }) => {
  const isMobile = useIsMobile('sm');

  return (
    <Typography
      variant='body2'
      color='text.secondary'
      component={isMobile ? 'p' : 'span'}
      sx={sx}
    >
      <Box
        component='span'
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          mr: isMobile ? 0 : 2,
        }}
      >
        {Icon && <Icon fontSize='inherit' color='inherit' />}
        {children}
      </Box>
    </Typography>
  );
};

export default ReferralStepDatum;
