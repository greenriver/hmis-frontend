import { DateType } from '@date-io/type';
import { SxProps, Theme } from '@mui/material';
import {
  DatePicker as MuiDatePicker,
  DatePickerProps,
} from '@mui/x-date-pickers';
import { isAfter, isBefore, isPast } from 'date-fns';
import { useCallback, useMemo, useState } from 'react';

import TextInput, { TextInputProps } from './TextInput';

import { DynamicInputCommonProps, isDate } from '@/modules/form/types';
import { isValidDate } from '@/modules/form/util/formUtil';
import { formatDateForDisplay } from '@/modules/hmis/hmisUtil';

interface PickerProps
  extends Omit<DatePickerProps<DateType, DateType>, 'renderInput'> {
  sx?: SxProps<Theme>;
  textInputProps?: TextInputProps;
}

type Props = PickerProps & DynamicInputCommonProps;

const DatePicker = ({
  sx,
  textInputProps,
  error,
  min,
  max,
  value,
  helperText,
  warnIfEmptyTreatment,
  ...props
}: Props) => {
  const defaultOpenMonth = useMemo(() => {
    if (isDate(min)) return min;
    if (isDate(max) && isPast(max)) return max;
    return undefined;
  }, [min, max]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      defaultCalendarMonth={defaultOpenMonth}
      renderInput={(params) => (
        <TextInput
          sx={sx}
          onBlur={handleBlur}
          {...textInputProps}
          {...params}
          error={error || !!errorMessage}
          warnIfEmptyTreatment={warnIfEmptyTreatment}
          // If there is a server error, show that instead of the local message
          helperText={error ? undefined : errorMessage || helperText}
          FormHelperTextProps={{
            sx: { '&.Mui-error': { whiteSpace: 'nowrap' } },
          }}
        />
      )}
    />
  );
};

export default DatePicker;
