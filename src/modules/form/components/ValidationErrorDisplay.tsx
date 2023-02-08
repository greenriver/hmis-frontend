import { Box, Typography } from '@mui/material';
import { groupBy } from 'lodash-es';

import { ValidationError, ValidationType } from '@/types/gqlTypes';

export const ValidationWarningDisplay = ({
  warnings,
}: {
  warnings: ValidationError[];
}) => {
  const grouped = groupBy(warnings, (e) =>
    e.type === ValidationType.DataNotCollected ? 'dnc' : 'other'
  );

  return (
    <Box>
      {grouped.dnc && (
        <>
          <Typography>
            The following elements will be saved as <b>Data Not Collected</b>:
          </Typography>
          <Box component='ul' sx={{ mt: 1, mb: 2, pl: 3 }}>
            {grouped.dnc.map((e) => (
              <li key={e.fullMessage}>
                <Typography>{e.readableAttribute || e.attribute}</Typography>
              </li>
            ))}
          </Box>
        </>
      )}
      {grouped.other && (
        <>
          <Typography fontWeight={600}>Warnings:</Typography>
          <Box component='ul' sx={{ mt: 1, mb: 0, pl: 3 }}>
            {grouped.other.map((e) => (
              <li key={e.fullMessage}>
                <Typography>{e.fullMessage}</Typography>
              </li>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

const ValidationErrorDisplay = ({ errors }: { errors: ValidationError[] }) => {
  const grouped = groupBy(errors, (e) =>
    e.type === ValidationType.Required ? 'required' : 'other'
  );

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
          <li>
            <Typography variant='inherit'>{e.fullMessage}</Typography>
          </li>
        ))}
    </Box>
  );
};

export default ValidationErrorDisplay;
