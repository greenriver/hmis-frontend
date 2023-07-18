import { Box, Stack } from '@mui/system';
import { ReactNode } from 'react';

import { formatDateForDisplay, parseHmisDateString } from '../hmisUtil';

import { HouseholdClientFieldsFragment } from '@/types/gqlTypes';

const ACTIVE_TEXT = 'Active';

const EnrollmentDateRangeWithStatus = ({
  enrollment,
}: {
  enrollment: HouseholdClientFieldsFragment['enrollment'];
}) => {
  if (!enrollment.entryDate && !enrollment.exitDate) return null;
  const start = enrollment.entryDate
    ? parseHmisDateString(enrollment.entryDate)
    : null;
  const end = enrollment.exitDate
    ? parseHmisDateString(enrollment.exitDate)
    : null;
  const startFormatted = start
    ? formatDateForDisplay(start)
    : enrollment.entryDate || 'Unknown';
  let endFormatted: string | ReactNode = end
    ? formatDateForDisplay(end)
    : enrollment.exitDate || ACTIVE_TEXT;

  let color;
  if (!enrollment.exitDate && enrollment.inProgress) {
    color = 'error.main';
    endFormatted = 'Incomplete';
  } else if (!enrollment.exitDate) {
    color = 'success.main';
  }

  return (
    <Stack direction='row' gap={0.5}>
      <Box component='span'>{startFormatted}</Box>
      {' - '}
      <Box component='span' sx={{ px: 0, color }}>
        {endFormatted}
      </Box>
    </Stack>
  );
};

export default EnrollmentDateRangeWithStatus;
