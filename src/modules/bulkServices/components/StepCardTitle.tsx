import { Box, Typography } from '@mui/material';
import { Stack, SxProps } from '@mui/system';
import React, { ReactNode } from 'react';

export const StepCardTitle: React.FC<{
  step: string;
  title: string;
  sx?: SxProps;
  action?: ReactNode;
  component?: React.ElementType;
}> = ({ step, title, action, sx, component = 'h2' }) => (
  <Stack
    justifyContent='space-between'
    direction='row'
    sx={{ width: '100%', p: 2, ...sx }}
  >
    <Stack direction='row' gap={2} alignItems='center'>
      <Box
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          borderRadius: '50%',
          width: '26px',
          height: '26px',
          lineHeight: '26px',
          textAlign: 'center',
          fontWeight: 600,
        }}
      >
        {step}
      </Box>
      <Typography variant='h4' component={component}>
        {title}
      </Typography>
    </Stack>
    {action}
  </Stack>
);

export default StepCardTitle;
