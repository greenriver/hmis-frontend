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
  formatRelativeDate,
  formatRelativeDateTime,
  parseHmisDateString,
} from '@/modules/hmis/hmisUtil';

export const getFormattedDates = (dateString: string) => {
  const date = parseHmisDateString(dateString); // parse Date or DateTime string into Date object
  if (!date) return [];

  const isDateTime = dateString.length > 10;
  return [
    isDateTime ? formatDateTimeForDisplay(date) : formatDateForDisplay(date),
    isDateTime ? formatRelativeDateTime(date) : formatRelativeDate(date),
  ];
};

export interface RelativeDateDisplayProps {
  dateString: string; // can be date or datetime string
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
