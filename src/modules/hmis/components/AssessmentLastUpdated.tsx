import { SxProps, Tooltip, Typography } from '@mui/material';
import { useMemo } from 'react';

import {
  formatDateTimeForDisplay,
  formatRelativeDateTime,
  parseHmisDateString,
} from '@/modules/hmis/hmisUtil';

const AssessmentLastUpdated = ({
  lastSaved,
  lastSubmitted,
  sx,
}: {
  lastSaved?: string; // datetime string
  lastSubmitted?: string; // datetime string
  sx?: SxProps;
}) => {
  const [lastUpdated, lastUpdatedRelative, lastUpdatedVerb] = useMemo(() => {
    let date;
    let verb;
    if (lastSubmitted) {
      date = parseHmisDateString(lastSubmitted);
      verb = 'submitted';
    } else if (lastSaved) {
      date = parseHmisDateString(lastSaved);
      verb = 'saved';
    }

    if (date) {
      return [
        formatDateTimeForDisplay(date),
        formatRelativeDateTime(date),
        verb,
      ];
    }
    return [];
  }, [lastSaved, lastSubmitted]);

  if (!lastUpdated || !lastUpdatedRelative || !lastUpdatedVerb) return null;

  return (
    <Tooltip
      title={<Typography>{lastUpdated}</Typography>}
      arrow
      placement='right'
    >
      <Typography
        alignSelf='center'
        color='text.secondary'
        variant='body2'
        sx={{
          px: 2,
          py: 1,
          borderRadius: 1,
          fontStyle: 'italic',
          ...sx,
        }}
      >
        Last {lastUpdatedVerb} {lastUpdatedRelative}
      </Typography>
    </Tooltip>
  );
};
export default AssessmentLastUpdated;
