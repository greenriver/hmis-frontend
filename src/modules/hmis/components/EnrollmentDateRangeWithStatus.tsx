import { Box, Stack } from '@mui/system';
import { ReactNode } from 'react';

import { formatDateForDisplay, parseHmisDateString } from '../hmisUtil';

import { EnrollmentRangeFieldsFragment } from '@/types/gqlTypes';

const ACTIVE_TEXT = 'Ongoing';

const EnrollmentDateRangeWithStatus = ({
  enrollment,
  treatIncompleteAsActive = false,
}: {
  enrollment: EnrollmentRangeFieldsFragment;
  // if the status is called out separately, use this prop to render
  // incomplete as if it were active
  treatIncompleteAsActive?: boolean;
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
  if (
    !enrollment.exitDate &&
    enrollment.inProgress &&
    !treatIncompleteAsActive
  ) {
    color = 'error.main';
    endFormatted = 'Incomplete';
  } else if (!enrollment.exitDate) {
    color = 'text.disabled';
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
