import { Box, Typography } from '@mui/material';
import { groupBy } from 'lodash-es';

import { ValidationError, ValidationType } from '@/types/gqlTypes';

const ValidationErrorList = ({ errors }: { errors: ValidationError[] }) => {
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
      {grouped.other &&
        grouped.other.map((e) => (
          <li key={e.fullMessage}>
            <Typography variant='inherit'>{e.fullMessage}</Typography>
          </li>
        ))}
    </Box>
  );
};

export default ValidationErrorList;
