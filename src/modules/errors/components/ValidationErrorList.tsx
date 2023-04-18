import { Box, Typography } from '@mui/material';
import { groupBy } from 'lodash-es';

import { ErrorRenderFn } from '../util';

import { ValidationError, ValidationType } from '@/types/gqlTypes';

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
  const grouped = groupBy(errors, (e) =>
    e.type === ValidationType.Required ? 'required' : 'other'
  );

  if (grouped.other?.length === 1 && !grouped.required) {
    return (
      <Box sx={{ mt: 1 }}>
        <Typography variant='inherit'>
          {grouped.other[0].fullMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Box component='ul' sx={{ mt: 1, mb: 2, pl: 2.5 }}>
      {grouped.required && (
        <li>
          <Typography variant='inherit'>
            Missing Required Fields:{' '}
            <b>
              {grouped.required
                .map((e) => e.readableAttribute || e.attribute)
                .join(', ')}
            </b>
          </Typography>
        </li>
      )}
      {grouped.other && grouped.other.map((e) => renderError(e))}
    </Box>
  );
};

export default ValidationErrorList;
