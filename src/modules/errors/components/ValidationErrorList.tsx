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
  const listStyle =
    errors.length === 1 ? { pl: 0, listStyle: 'none' } : { pl: 2.5 };
  return (
    <Box
      component='ul'
      sx={{
        my: 0,
        ...listStyle,
      }}
    >
      {errors.map((e) => renderError(e))}
    </Box>
  );
};

export default ValidationErrorList;
