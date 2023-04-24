import { Box, lighten, Stack, Typography } from '@mui/material';
import { groupBy, reject } from 'lodash-es';
import { ReactNode } from 'react';

import { ErrorRenderFn } from '../util';

import { ValidationError, ValidationType } from '@/types/gqlTypes';

const WarningSection = ({
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

export const defaultRenderError: ErrorRenderFn = (
  e: ValidationError,
  { attributeOnly } = {}
) => (
  <li key={e.fullMessage}>
    <Typography variant='body2'>
      {attributeOnly ? e.readableAttribute || e.attribute : e.fullMessage}
    </Typography>
  </li>
);

const WarningList = ({
  title,
  errors,
  attributeOnly = false,
  renderError = defaultRenderError,
}: {
  title?: string;
  errors: ValidationError[];
  attributeOnly?: boolean;
  renderError?: ErrorRenderFn;
}) => (
  <Box>
    {title && (
      <Typography variant='body2' fontWeight={600}>
        {title}
      </Typography>
    )}
    <Box component='ul' sx={{ mt: 0, pl: 3, mb: 1 }}>
      {errors.map((e) => renderError(e, { attributeOnly }))}
    </Box>
  </Box>
);

const WarningAlert = ({
  warnings: validations,
  renderError,
}: {
  warnings: ValidationError[];
  renderError?: ErrorRenderFn;
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
        <WarningSection
          header={<Typography fontWeight={600}>Warnings</Typography>}
        >
          <WarningList errors={grouped.other} renderError={renderError} />
        </WarningSection>
      )}
      {grouped.dnc && (
        <WarningSection
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
                <WarningList
                  key={title}
                  title={title}
                  errors={errors}
                  attributeOnly
                  renderError={renderError}
                />
              )
            )}
          </Stack>
        </WarningSection>
      )}
    </Stack>
  );
};

export default WarningAlert;
