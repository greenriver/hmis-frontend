import { DateType } from '@date-io/type';
import { SxProps, Theme } from '@mui/material';
import {
  DatePicker as MuiDatePicker,
  DatePickerProps,
} from '@mui/x-date-pickers';
import { getYear, isAfter, isBefore, isPast, isValid } from 'date-fns';
import { useMemo, useState } from 'react';

import TextInput, { TextInputProps } from './TextInput';

import { DynamicInputCommonProps } from '@/modules/form/components/DynamicField';
import { isDate } from '@/modules/form/util/formUtil';
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
  ...props
}: Props) => {
  const defaultOpenMonth = useMemo(() => {
    if (isDate(min)) return min;
    if (isDate(max) && isPast(max)) return max;
    return undefined;
  }, [min, max]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleBlur = () => {
    let msg = null;
    if (value && isDate(value)) {
      if (!isValid(value)) {
        msg = 'Invalid date';
      } else if (getYear(value) < 1900) {
        msg = 'Invalid date';
      } else if (
        isDate(min) &&
        isDate(max) &&
        (isBefore(value, min) || isAfter(value, max))
      ) {
        msg = `Must be in range ${formatDateForDisplay(
          min
        )} - ${formatDateForDisplay(max)}`;
      } else if (isDate(min) && isBefore(value, min)) {
        msg = `Must be on or after ${formatDateForDisplay(min)}`;
      } else if (isDate(max) && isAfter(value, max)) {
        msg = `Must be on or before ${formatDateForDisplay(max)}`;
      }
    }
    setErrorMessage(msg);
  };

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
          helperText={errorMessage}
          FormHelperTextProps={{
            sx: { '&.Mui-error': { whiteSpace: 'nowrap' } },
          }}
        />
      )}
    />
  );
};

export default DatePicker;
