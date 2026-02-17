import { Box, Paper } from '@mui/material';
import React, { ReactNode } from 'react';
import StepCardTitle from './StepCardTitle';
import CommonCard from '@/components/elements/CommonCard';

const StepCard: React.FC<{
  step: string;
  children?: React.ReactNode;
  title: string;
  padded?: boolean;
  action?: ReactNode;
  disabled?: boolean;
  disabledText?: string;
  component?: React.ElementType;
}> = ({
  step,
  title,
  children,
  action,
  padded,
  disabled,
  disabledText,
  component = 'h2',
}) => (
  <Paper
    sx={{
      pr: padded && !disabled ? 6 : undefined,
      pb: padded && !disabled ? 3 : 0,
    }}
  >
    <StepCardTitle
      step={step}
      title={title}
      action={action}
      component={component}
    />

    {disabled ? (
      <CommonCard
        sx={{
          m: 2,
          textAlign: 'center',
          color: 'text.secondary',
          backgroundColor: 'grayscale.surface',
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
