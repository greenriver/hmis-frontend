import { Box, Paper, Typography } from '@mui/material';
import { Stack, SxProps } from '@mui/system';
import React, { ReactNode } from 'react';
import { CommonCard } from '@/components/elements/CommonCard';

export const StepCardTitle: React.FC<{
  step: string;
  title: string;
  sx?: SxProps;
  action?: ReactNode;
}> = ({ step, title, action, sx }) => (
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
      <Typography variant='h4'>{title}</Typography>
    </Stack>
    {action}
  </Stack>
);

const StepCard: React.FC<{
  step: string;
  children?: React.ReactNode;
  title: string;
  padded?: boolean;
  action?: ReactNode;
  disabled?: boolean;
  disabledText?: string;
}> = ({ step, title, children, action, padded, disabled, disabledText }) => (
  <Paper
    sx={{
      pr: padded && !disabled ? 6 : undefined,
      pb: padded && !disabled ? 3 : 0,
    }}
  >
    <StepCardTitle step={step} title={title} action={action} />

    {disabled ? (
      <CommonCard
        sx={{
          m: 2,
          textAlign: 'center',
          color: 'text.disabled',
          backgroundColor: (theme) => theme.palette.background.default,
          border: 'unset',
        }}
      >
        {disabledText}
      </CommonCard>
    ) : (
      <Box pl={padded ? 7 : undefined}>{children}</Box>
    )}
  </Paper>
);
export default StepCard;
