import { Typography } from '@mui/material';
import {
  formatDateTimeForDisplay,
  formatRelativeDateTime,
  parseHmisDateString,
} from '@/modules/hmis/hmisUtil';
import { UserFieldsFragment } from '@/types/gqlTypes';

const AssessmentHistoryInfo: React.FC<{
  label: string;
  user?: UserFieldsFragment | null;
  date?: string | null;
}> = ({ label, user, date }) => {
  const fmtDate = parseHmisDateString(date);
  const relativeDate = fmtDate ? ` (${formatRelativeDateTime(fmtDate)})` : '';

  let content: string | null = null;
  if (fmtDate && user) {
    content = `${user.name} at ${formatDateTimeForDisplay(
      fmtDate
    )}${relativeDate}`;
  } else if (user) {
    // this case probably doesn't occur in practice, we should always have dates
    content = user.name;
  } else if (fmtDate) {
    content = `Unknown User at ${formatDateTimeForDisplay(
      fmtDate
    )}${relativeDate}`;
  }

  if (content) {
    return (
      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
        {`${label} ${content}`}
      </Typography>
    );
  }
};

export default AssessmentHistoryInfo;
