import { Stack, Tooltip, Typography, TypographyProps } from '@mui/material';

import {
  formatDateTimeForDisplay,
  formatRelativeDate,
  formatRelativeDateTime,
  parseAndFormatDate,
  parseHmisDateString,
} from '@/modules/hmis/hmisUtil';

interface Props extends TypographyProps {
  dateString: string;
  dateUpdated?: string;
  withTooltip?: boolean;
  prefix?: string;
}
const RelativeDate = ({
  dateString,
  dateUpdated,
  withTooltip,
  prefix = '',
  ...props
}: Props) => {
  const date = parseHmisDateString(dateString);
  const formattedDateString = parseAndFormatDate(dateString);
  const relativeDateString = date ? formatRelativeDate(date) : null;

  const contents = (
    <Typography {...props}>
      {relativeDateString || formattedDateString}
    </Typography>
  );

  if (!withTooltip) return contents;

  let lastUpdated = '';
  let lastUpdatedDist = '';
  if (dateUpdated) {
    const d = parseHmisDateString(dateUpdated);
    if (d) {
      lastUpdated = formatDateTimeForDisplay(d) || '';
      lastUpdatedDist = formatRelativeDateTime(d);
    }
  }

  return (
    <Tooltip
      placement='top'
      arrow
      title={
        <Stack>
          <Typography variant='inherit'>
            <b>{prefix}</b>
            {formattedDateString} ({relativeDateString})
          </Typography>
          {lastUpdated && (
            <Typography variant='inherit'>
              <b>Last Updated:</b> {lastUpdated} ({lastUpdatedDist})
            </Typography>
          )}
        </Stack>
      }
      PopperProps={{
        sx: {
          '.MuiTooltip-tooltipPlacementTop': {
            mb: '6px !important',
          },
        },
      }}
    >
      {contents}
    </Tooltip>
  );
};
export default RelativeDate;
