import { SxProps, Theme } from '@mui/material';
import {
  DatePickerProps,
  DesktopDatePicker,
  MobileDatePicker,
} from '@mui/x-date-pickers';
import { isAfter, isBefore, isPast } from 'date-fns';
import { useCallback, useMemo, useState } from 'react';

import TextInput, { TextInputProps } from './TextInput';

import { useIsMobile } from '@/hooks/useIsMobile';
import { DynamicInputCommonProps, isDate } from '@/modules/form/types';
import { isValidDate } from '@/modules/form/util/formUtil';
import { formatDateForDisplay } from '@/modules/hmis/hmisUtil';

interface PickerProps extends Omit<DatePickerProps<Date>, 'renderInput'> {
  sx?: SxProps<Theme>;
  textInputProps?: TextInputProps;
}

type Props = PickerProps & DynamicInputCommonProps;

const DatePicker: React.FC<Props> = ({
  sx,
  textInputProps,
  error,
  min,
  max,
  value,
  helperText,
  warnIfEmptyTreatment,
  ariaLabel,
  ...props
}) => {
  // If max date is in the past, default to the max date's month
  const defaultOpenMonth = useMemo(() => {
    // if (isDate(min)) return min;
    if (isDate(max) && isPast(max)) return max;
    return undefined;
  }, [max]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isMobile = useIsMobile();
  const MuiDatePicker = isMobile ? MobileDatePicker : DesktopDatePicker;

  const handleBlur = useCallback(() => {
    let msg = null;
    if (value && isDate(value)) {
      if (!isValidDate(value)) {
        msg = 'Invalid date';
      } else if (
        isDate(min) &&
        isDate(max) &&
        (isBefore(value, min) || isAfter(value, max))
      ) {
        msg = `Must be in range ${formatDateForDisplay(
          min
        )} - ${formatDateForDisplay(max)}`;
      } else if (isDate(min) && isValidDate(min) && isBefore(value, min)) {
        msg = `Must be on or after ${formatDateForDisplay(min)}`;
      } else if (isDate(max) && isValidDate(max) && isAfter(value, max)) {
        msg = `Must be on or before ${formatDateForDisplay(max)}`;
      }
    }
    setErrorMessage(msg);
  }, [value, max, min]);

  return (
    <MuiDatePicker
      {...props}
      value={value}
      showDaysOutsideCurrentMonth
      minDate={isDate(min) ? min : undefined}
      maxDate={isDate(max) ? max : undefined}
      referenceDate={defaultOpenMonth}
      slots={{
        textField: TextInput,
      }}
      slotProps={{
        textField: {
          sx,
          onBlur: handleBlur,
          ...textInputProps,
          inputProps: {
            'aria-label': ariaLabel,
            ...textInputProps?.inputProps,
          },
          error: error || !!errorMessage,
          //eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          warnIfEmptyTreatment,
          // If there is a server error, show that instead of the local message
          helperText: error ? undefined : errorMessage || helperText,
          FormHelperTextProps: {
            sx: { '&.Mui-error': { whiteSpace: 'nowrap' } },
          },
        },
      }}
    />
  );
};

export default DatePicker;
