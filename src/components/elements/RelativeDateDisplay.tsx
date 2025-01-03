import {
  Tooltip,
  TooltipProps,
  Typography,
  TypographyProps,
} from '@mui/material';
import { useMemo } from 'react';

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
          {formattedDate}
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
        {prefixVerb || null} {formattedDateRelative} {suffixText || null}
      </Typography>
    </Tooltip>
  );
};
export default RelativeDateDisplay;
