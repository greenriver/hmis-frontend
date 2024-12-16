import {
  Tooltip,
  TooltipProps,
  Typography,
  TypographyProps,
} from '@mui/material';
import { useMemo } from 'react';

import { getFormattedDates } from './RelativeDateDisplay';

export interface DateWithRelativeTooltipProps {
  dateString: string;
  preciseTime?: boolean;
  TooltipProps?: Omit<TooltipProps, 'title' | 'children'>;
  TypographyProps?: TypographyProps;
}

/**
 * Date with relative date as tooltip
 */
const DateWithRelativeTooltip = ({
  dateString,
  preciseTime = false,
  TooltipProps = {},
  TypographyProps = {},
}: DateWithRelativeTooltipProps) => {
  const [formattedDate, formattedDateRelative] = useMemo(
    () => getFormattedDates(dateString, preciseTime),
    [dateString, preciseTime]
  );

  if (!dateString || !formattedDate || !formattedDateRelative) return null;

  return (
    <Tooltip
      title={
        <Typography component='span' variant='inherit'>
          {formattedDateRelative}
        </Typography>
      }
      arrow
      {...TooltipProps}
    >
      <Typography
        component='span'
        variant='inherit'
        {...TypographyProps}
        sx={{
          cursor: 'pointer',
          ...TypographyProps.sx,
        }}
      >
        {formattedDate}
      </Typography>
    </Tooltip>
  );
};

export default DateWithRelativeTooltip;
