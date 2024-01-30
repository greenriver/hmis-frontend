import { Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { formatDateTimeForDisplay, formatRelativeDateTime } from '../hmisUtil';

interface Props {
  dateTimeString?: string;
  horizontal?: boolean;
}
const RelativeDateTableCellContents: React.FC<Props> = ({
  dateTimeString,
  horizontal = false,
}) => {
  if (!dateTimeString) return;

  if (horizontal) {
    return (
      <Stack direction='row' gap={1}>
        <span>{formatDateTimeForDisplay(new Date(dateTimeString))}</span>
        <span>({formatRelativeDateTime(new Date(dateTimeString))})</span>
      </Stack>
    );
  }
  return (
    <Stack>
      <span>{formatDateTimeForDisplay(new Date(dateTimeString))}</span>
      <Typography component='span' variant='body2' color='text.secondary'>
        {formatRelativeDateTime(new Date(dateTimeString))}
      </Typography>
    </Stack>
  );
};

export default RelativeDateTableCellContents;
