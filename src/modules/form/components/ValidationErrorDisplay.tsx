import { Box, lighten, Stack, Typography } from '@mui/material';
import { groupBy, reject } from 'lodash-es';
import { ReactNode } from 'react';

import { ValidationError, ValidationType } from '@/types/gqlTypes';

const ErrorList = ({
  title,
  errors,
  attributeOnly = false,
}: {
  title?: string;
  errors: ValidationError[];
  attributeOnly?: boolean;
}) => (
  <Box>
    {title && (
      <Typography variant='body2' fontWeight={600}>
        {title}
      </Typography>
    )}
    <Box component='ul' sx={{ mt: 0, pl: 3, mb: 1 }}>
      {errors.map((e) => (
        <li key={e.fullMessage}>
          <Typography variant='body2'>
            {attributeOnly ? e.readableAttribute || e.attribute : e.fullMessage}
          </Typography>
        </li>
      ))}
    </Box>
  </Box>
);

const ErrorSection = ({
  header,
  children,
}: {
  header: ReactNode;
  children: ReactNode;
}) => (
  <Box
    sx={{
      backgroundColor: lighten('#FFF9EB', 0.5),
    }}
  >
    <Box
      sx={{
        px: 2,
        py: 2,
        backgroundColor: '#FFF9EB',
      }}
    >
      {header}
    </Box>
    <Box sx={{ px: 2, py: 2 }}>{children}</Box>
  </Box>
);

export const ValidationWarningDisplay = ({
  warnings: validations,
}: {
  warnings: ValidationError[];
}) => {
  const warnings = reject(validations, ['severity', 'error']);
  if (warnings.length === 0) return null;

  // Split into 2 groups (dnc vs other)
  const grouped = groupBy(warnings, (e) =>
    e.type === ValidationType.DataNotCollected ? 'dnc' : 'other'
  );

  return (
    <Stack gap={4}>
      {grouped.other && (
        <ErrorSection
          header={<Typography fontWeight={600}>Warnings</Typography>}
        >
          <ErrorList errors={grouped.other} />
        </ErrorSection>
      )}
      {grouped.dnc && (
        <ErrorSection
          header={
            <Typography fontWeight={600}>
              {grouped.dnc.length} field
              {grouped.dnc.length === 1 ? ' was ' : 's were '}
              left empty
            </Typography>
          }
        >
          <Stack gap={1}>
            {/* group DNC warnings by form section */}
            {Object.entries(groupBy(grouped.dnc, 'section')).map(
              ([title, errors]) => (
                <ErrorList
                  key={title}
                  title={title}
                  errors={errors}
                  attributeOnly
                />
              )
            )}
          </Stack>
        </ErrorSection>
      )}
    </Stack>
  );
};

const ValidationErrorDisplay = ({ errors }: { errors: ValidationError[] }) => {
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
          <li>
            <Typography variant='inherit'>{e.fullMessage}</Typography>
          </li>
        ))}
    </Box>
  );
};

export default ValidationErrorDisplay;
