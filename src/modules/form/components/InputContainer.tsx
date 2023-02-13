import { Grid, SxProps, Typography } from '@mui/material';
import { ReactNode } from 'react';

import { ValidationError, ValidationType } from '@/types/gqlTypes';

const InputContainer = ({
  sx,
  errors,
  children,
  horizontal,
}: {
  sx: SxProps;
  errors?: ValidationError[];
  children: ReactNode;
  horizontal: boolean;
}) => (
  <Grid item sx={{ ...sx }} data-testid='formField'>
    {children}
    {errors &&
      errors
        .filter(({ type }) => type !== ValidationType.Required)
        .map(({ message, fullMessage }) => (
          <Typography
            variant='body2'
            color='error'
            key={fullMessage || message}
            sx={{ mt: 0.5, float: horizontal ? 'right' : undefined }}
          >
            {fullMessage || message}
          </Typography>
        ))}
  </Grid>
);

export default InputContainer;
