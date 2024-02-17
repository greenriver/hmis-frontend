import { SxProps, Theme } from '@mui/material';
import {
  DesktopTimePicker,
  MobileTimePicker,
  TimePickerProps,
} from '@mui/x-date-pickers';
import { addMinutes, differenceInMinutes, startOfDay } from 'date-fns';
import { useCallback, useRef, useState } from 'react';

import TextInput, { TextInputProps } from './TextInput';

import { useIsMobile } from '@/hooks/useIsMobile';
import { DynamicInputCommonProps } from '@/modules/form/types';

const minutesFromMidnight = (date: Date) => {
  const midnight = startOfDay(date);

  return differenceInMinutes(date, midnight);
};

const minutesToDate = (today: Date, minutes: number): Date | undefined => {
  return addMinutes(today, minutes);
};

interface PickerProps
  extends Omit<TimePickerProps<Date>, 'onChange' | 'value'> {
  sx?: SxProps<Theme>;
  textInputProps?: TextInputProps;
  value: string | undefined | null;
  onChange?: (value: string | undefined | null) => void;
}

type Props = PickerProps & DynamicInputCommonProps;

const TimeOfDayPicker: React.FC<Props> = ({
  sx,
  textInputProps,
  error,
  value: stringValue,
  onChange,
  helperText,
  warnIfEmptyTreatment,
  ...props
}) => {
  const mountTime = useRef(startOfDay(new Date()));

  // time picker takes a date as an input. For this input, we don't care about the particular date, only the time of day.
  // keep value in state so the Date object doesn't keep changing on the input
  const [value] = useState(() => {
    if (typeof stringValue !== 'string') return;
    return minutesToDate(mountTime.current, parseInt(stringValue));
  });

  const MuiTimePicker = useIsMobile() ? MobileTimePicker : DesktopTimePicker;

  const handleChange = useCallback(
    (value: Date | null) => {
      if (!onChange) return;
      // value was cleared
      if (!value) return onChange(null);

      const minutes = value ? minutesFromMidnight(value) : undefined;
      if (!minutes || isNaN(minutes)) return;
      onChange?.(minutes + '');
    },
    [onChange]
  );

  return (
    <MuiTimePicker
      {...props}
      onChange={handleChange}
      onAccept={handleChange}
      value={value || undefined}
      showDaysOutsideCurrentMonth
      referenceDate={mountTime.current}
      slots={{
        textField: TextInput,
      }}
      sections={null}
      slotProps={{
        textField: {
          sx,
          placeholder: 'HH:MM AM/PM',
          error,
          ...textInputProps,
          // the slotProps don't accept types that aren't MUI text input; they do seem to work
          //eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          warnIfEmptyTreatment,
          helperText: error ? undefined : helperText,
          FormHelperTextProps: {
            sx: { '&.Mui-error': { whiteSpace: 'nowrap' } },
          },
        },
      }}
    />
  );
};

export default TimeOfDayPicker;
