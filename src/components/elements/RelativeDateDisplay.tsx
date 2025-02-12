import {
  Box,
  Tooltip,
  TooltipProps,
  Typography,
  TypographyProps,
} from '@mui/material';
import { useMemo } from 'react';

import { customVisuallyHidden } from '@/config/theme';
import {
  formatDateForDisplay,
  formatDateTimeForDisplay,
  formatRelativeDateTime,
  parseHmisDateString,
} from '@/modules/hmis/hmisUtil';

export const getFormattedDates = (
  dateString: string,
  preciseTime: boolean = true
) => {
  const date = parseHmisDateString(dateString);
  if (!date) return [];
  return [
    preciseTime ? formatDateTimeForDisplay(date) : formatDateForDisplay(date),
    formatRelativeDateTime(date),
  ];
};

export interface RelativeDateDisplayProps {
  dateString: string;
  prefixVerb?: string;
  suffixText?: string;
  tooltipSuffixText?: string;
  TooltipProps?: Omit<TooltipProps, 'title' | 'children'>;
  TypographyProps?: TypographyProps;
}

/**
 * Relative date with actual date as a tooltip
 */
const RelativeDateDisplay = ({
  dateString,
  prefixVerb,
  suffixText,
  tooltipSuffixText,
  TooltipProps = {},
  TypographyProps = {},
}: RelativeDateDisplayProps) => {
  const [formattedDate, formattedDateRelative] = useMemo(
    () => getFormattedDates(dateString),
    [dateString]
  );

  if (!dateString || !formattedDate || !formattedDateRelative) return null;

  return (
    <Tooltip
      title={
        <Typography component='span' variant='inherit'>
          {formattedDate} {tooltipSuffixText}
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
        {/* Include the tooltip text as visually hidden for accessibility */}
        {prefixVerb || null} {formattedDateRelative}{' '}
        <Box sx={customVisuallyHidden}>
          ({formattedDate} {tooltipSuffixText})
        </Box>{' '}
        {suffixText || null}
      </Typography>
    </Tooltip>
  );
};
export default RelativeDateDisplay;
