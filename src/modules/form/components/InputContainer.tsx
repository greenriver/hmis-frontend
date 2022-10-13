import { Grid, SxProps, Typography } from '@mui/material';
import { ReactNode } from 'react';

import { ValidationError } from '@/types/gqlTypes';

const InputContainer = ({
  sx,
  errors,
  children,
}: {
  sx: SxProps;
  errors?: ValidationError[];
  children: ReactNode;
}) => (
  <Grid item sx={sx}>
    {children}
    {errors &&
      errors.map(({ message, fullMessage }) => (
        <Typography
          variant='body2'
          color='error'
          key={fullMessage || message}
          sx={{ mt: 0.5 }}
        >
          {fullMessage || message}
        </Typography>
      ))}
  </Grid>
);

export default InputContainer;
