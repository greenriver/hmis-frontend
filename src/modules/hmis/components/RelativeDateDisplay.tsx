import {
  Tooltip,
  TooltipProps,
  Typography,
  TypographyProps,
} from '@mui/material';
import { useMemo } from 'react';

import {
  formatDateTimeForDisplay,
  formatRelativeDateTime,
  parseHmisDateString,
} from '@/modules/hmis/hmisUtil';

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
  const [formattedDate, formattedDateRelative] = useMemo(() => {
    const date = parseHmisDateString(dateString);
    if (!date) return [];
    return [formatDateTimeForDisplay(date), formatRelativeDateTime(date)];
  }, [dateString]);

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
