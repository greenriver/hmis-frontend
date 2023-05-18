import { Box, Typography } from '@mui/material';

import { ErrorRenderFn } from '../util';

import { ValidationError } from '@/types/gqlTypes';

export const defaultRenderError: ErrorRenderFn = (e: ValidationError) => (
  <li key={e.fullMessage}>
    <Typography variant='inherit'>{e.fullMessage}</Typography>
  </li>
);

const ValidationErrorList = ({
  errors,
  renderError = defaultRenderError,
}: {
  errors: ValidationError[];
  renderError?: ErrorRenderFn;
}) => {
  return (
    <Box component='ul' sx={{ mt: 1, mb: 2, pl: 2.5 }}>
      {errors.map((e) => renderError(e))}
    </Box>
  );
};

export default ValidationErrorList;
