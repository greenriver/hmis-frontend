import {
  Box,
  Tooltip,
  TooltipProps,
  Typography,
  TypographyProps,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
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
        {/* Include the tooltip text as visually hidden for accessibility */}
        {/* Add position: fixed to address visual bug when visuallyHidden is used inside dialog */}
        <Box sx={{ ...visuallyHidden, position: 'fixed' }}>
          , {formattedDateRelative}
        </Box>
      </Typography>
    </Tooltip>
  );
};

export default DateWithRelativeTooltip;
