import { FormControl, FormHelperText, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { ReactElement, useCallback, useMemo } from 'react';
import NumberInput from '@/components/elements/input/NumberInput';
import { TextInputProps } from '@/components/elements/input/TextInput';

type Props = { value?: number; onChange?: (val: number | null) => void } & Omit<
  TextInputProps,
  'value' | 'onChange'
>;

export const minutesToHoursAndMinutes = (minutes: number) => {
  return [Math.floor(minutes / 60), minutes % 60];
};

const MinutesDurationInput = ({
  value,
  onChange,
  label,
  helperText,
  ...props
}: Props) => {
  const [hours, minutes] = useMemo(() => {
    if (!value) return ['', ''];
    return minutesToHoursAndMinutes(value);
  }, [value]);

  const getIntValue = (v?: string | number) => {
    if (!v) return 0;
    if (typeof v === 'string') return parseInt(v);
    return v;
  };

  const hoursMinutesToValue = useCallback(
    (hours?: string | number, minutes?: string | number) => {
      const h = getIntValue(hours);
      const m = getIntValue(minutes);
      return h * 60 + m;
    },
    []
  );

  const onHoursChange = useCallback(
    (hours: string | number) => {
      if (onChange) onChange(hoursMinutesToValue(hours, minutes));
    },
    [onChange, hoursMinutesToValue, minutes]
  );

  const onMinutesChange = useCallback(
    (minutes: string | number) => {
      if (onChange) onChange(hoursMinutesToValue(hours, minutes));
    },
    [onChange, hoursMinutesToValue, hours]
  );

  const getAdornment = useCallback((text: string) => {
    return (
      <Typography variant='subtitle2' color='text.secondary' component='span'>
        {text}
      </Typography>
    );
  }, []);

  const getLabelText = useCallback(() => {
    if ((label as ReactElement).props)
      return (label as ReactElement).props.text;
    return label;
  }, [label]);

  return (
    <FormControl>
      {label}
      <Stack alignItems='center' direction='row' gap={1} sx={{ mt: 0.5 }}>
        <NumberInput
          {...props}
          value={hours || ''}
          onChange={(e) => onHoursChange(e.target.value)}
          label={null}
          helperText={null}
          fullWidth={false}
          placeholder='0'
          ariaLabelledBy={getLabelText() + ' (hours)'}
          inputWidth={90}
          InputProps={{
            endAdornment: getAdornment('hours'),
            ...props.InputProps,
          }}
        />
        <Typography variant='body1'>:</Typography>
        <NumberInput
          {...props}
          value={minutes || ''}
          onChange={(e) => onMinutesChange(e.target.value)}
          label={null}
          helperText={null}
          max={59}
          fullWidth={false}
          inputWidth={105}
          placeholder='0'
          ariaLabelledBy={getLabelText() + ' (minutes)'}
          InputProps={{
            endAdornment: getAdornment('minutes'),
            ...props.InputProps,
          }}
        />
      </Stack>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default MinutesDurationInput;
