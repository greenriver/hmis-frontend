import { SvgIconComponent } from '@mui/icons-material';
import { Box, Tooltip, Typography, TypographyProps } from '@mui/material';
import React from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';

interface TooltipKeyValueProps extends TypographyProps {
  title: string;
  Icon?: SvgIconComponent;
}

const TooltipKeyValue: React.FC<TooltipKeyValueProps> = ({
  title,
  Icon,
  children,
  ...typographyProps
}) => {
  const isMobile = useIsMobile('sm');

  return (
    <Tooltip title={title} arrow>
      <Typography
        variant='caption'
        color='text.secondary'
        component={isMobile ? 'p' : 'span'}
        {...typographyProps}
      >
        <Box
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
    </Tooltip>
  );
};

export default TooltipKeyValue;
