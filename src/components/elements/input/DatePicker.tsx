import { DateType } from '@date-io/type';
import { SxProps, Theme } from '@mui/material';
import {
  DatePicker as MuiDatePicker,
  DatePickerProps,
} from '@mui/x-date-pickers';
import { isPast } from 'date-fns';
import { useMemo } from 'react';

import TextInput, { TextInputProps } from './TextInput';

import { DynamicInputCommonProps } from '@/modules/form/components/DynamicField';
import { isDate } from '@/modules/form/util/formUtil';

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
  ...props
}: Props) => {
  const defaultOpenMonth = useMemo(() => {
    if (isDate(min)) return min;
    if (isDate(max) && isPast(max)) return max;
    return undefined;
  }, [min, max]);

  return (
    <MuiDatePicker
      {...props}
      showDaysOutsideCurrentMonth
      minDate={isDate(min) ? min : undefined}
      maxDate={isDate(max) ? max : undefined}
      defaultCalendarMonth={defaultOpenMonth}
      renderInput={(params) => (
        <TextInput sx={sx} {...textInputProps} {...params} error={error} />
      )}
    />
  );
};

export default DatePicker;
