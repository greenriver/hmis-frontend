import { Box, Paper, Typography } from '@mui/material';
import { Stack, SxProps } from '@mui/system';
import React from 'react';

export const StepCardTitle: React.FC<{
  step: string;
  title: string;
  sx?: SxProps;
}> = ({ step, title, sx }) => (
  <Stack direction='row' gap={2} alignItems='center' sx={{ p: 2, ...sx }}>
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
);
const StepCard: React.FC<{
  step: string;
  children: React.ReactNode;
  title: string;
  padded?: boolean;
}> = ({ step, title, children, padded }) => (
  <Paper
    sx={{
      pr: padded ? 6 : undefined,
      pb: padded ? 3 : 0,
    }}
  >
    <StepCardTitle step={step} title={title} />
    <Box pl={padded ? 7 : undefined}>{children}</Box>
  </Paper>
);
export default StepCard;
