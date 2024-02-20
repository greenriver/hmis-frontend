import { Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { memoize } from 'lodash-es';
import { useMemo } from 'react';
import NumberInput from '@/components/elements/input/NumberInput';
import { TextInputProps } from '@/components/elements/input/TextInput';

type Props = { value?: number; onChange?: (val: number | null) => void } & Omit<
  TextInputProps,
  'value' | 'onChange'
>;

const TimeDurationInput = ({ value, onChange, label, ...props }: Props) => {
  const [hours, minutes] = useMemo(() => {
    if (!value) return ['', ''];
    return [Math.floor(value / 60), value % 60];
  }, [value]);

  const getIntValue = (v?: string | number) => {
    if (!v) return 0;
    if (typeof v === 'string') return parseInt(v);
    return v;
  };

  const hoursMinutesToValue = memoize(
    (hours?: string | number, minutes?: string | number) => {
      const h = getIntValue(hours);
      const m = getIntValue(minutes);
      return h * 60 + m;
    }
  );

  return (
    <>
      {label}
      <Stack direction='row' gap={1}>
        <NumberInput
          {...props}
          value={hours}
          onChange={(e) => {
            if (onChange)
              onChange(hoursMinutesToValue(e.target.value, minutes));
          }}
          label={null}
          placeholder='Hours'
          fullWidth={false}
        />
        <Typography variant='body1'>:</Typography>
        <NumberInput
          {...props}
          value={minutes}
          onChange={(e) => {
            if (onChange) onChange(hoursMinutesToValue(hours, e.target.value));
          }}
          label={null}
          placeholder='Minutes'
          max={59}
          fullWidth={false}
        />
      </Stack>
    </>
  );
};

export default TimeDurationInput;
