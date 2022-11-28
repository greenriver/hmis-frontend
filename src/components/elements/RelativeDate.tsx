import { Tooltip, Typography, TypographyProps } from '@mui/material';

import {
  formatRelativeDate,
  parseAndFormatDate,
  parseHmisDateString,
} from '@/modules/hmis/hmisUtil';

interface Props extends TypographyProps {
  dateString: string;
  withTooltip?: boolean;
}
const RelativeDate = ({ dateString, withTooltip, ...props }: Props) => {
  const date = parseHmisDateString(dateString);
  const formattedDateString = parseAndFormatDate(dateString);
  const relativeDateString = date ? formatRelativeDate(date) : null;

  const contents = (
    <Typography {...props}>
      {relativeDateString || formattedDateString}
    </Typography>
  );

  if (!withTooltip) return contents;

  return (
    <Tooltip
      placement='top'
      arrow
      title={formattedDateString}
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
