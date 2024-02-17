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

  // keep value in state so the Date object doesn't keep changing on the input
  const [value] = useState(() => {
    if (typeof stringValue !== 'string') return;
    return minutesToDate(mountTime.current, parseInt(stringValue));
  });

  //if (stringValue) console.info('value toString', value, stringValue)

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
