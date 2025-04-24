import {
  Box,
  Tooltip,
  TooltipProps,
  Typography,
  TypographyProps,
} from '@mui/material';
import { useMemo } from 'react';

import { getFormattedDates } from './RelativeDateDisplay';
import { customVisuallyHidden } from '@/config/theme';

export interface DateWithRelativeTooltipProps {
  dateString: string;
  TooltipProps?: Omit<TooltipProps, 'title' | 'children'>;
  TypographyProps?: TypographyProps;
}

/**
 * Date with relative date as tooltip
 */
const DateWithRelativeTooltip = ({
  dateString,

  TooltipProps = {},
  TypographyProps = {},
}: DateWithRelativeTooltipProps) => {
  const [formattedDate, formattedDateRelative] = useMemo(
    () => getFormattedDates(dateString),
    [dateString]
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
        {/* Include the tooltip text as visually hidden for accessibility */}
        <Box sx={customVisuallyHidden}>, {formattedDateRelative}</Box>
      </Typography>
    </Tooltip>
  );
};

export default DateWithRelativeTooltip;
