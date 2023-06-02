import { Box, Stack } from '@mui/system';
import { ReactNode } from 'react';

import { formatDateForDisplay, parseHmisDateString } from '../hmisUtil';

import { HouseholdClientFieldsFragment } from '@/types/gqlTypes';

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
    : enrollment.exitDate || 'Active';

  if (!enrollment.exitDate && enrollment.inProgress) {
    endFormatted = (
      <Box color='error' component='span' sx={{ color: 'error.main' }}>
        Incomplete
      </Box>
    );
  }
  return (
    <Stack direction='row' gap={0.8}>
      {startFormatted}
      {' - '}
      {endFormatted}
    </Stack>
  );
};

export default EnrollmentDateRangeWithStatus;
