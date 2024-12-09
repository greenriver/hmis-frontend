import { InputAdornment } from '@mui/material';
import { isFinite, isNil } from 'lodash-es';
import { ChangeEventHandler, useState } from 'react';

import {
  NumberFormatValues,
  NumericFormat,
  OnValueChange,
} from 'react-number-format';
import TextInput, { TextInputProps } from './TextInput';

// protect from integer overflows
const withValueLimit = ({ floatValue }: NumberFormatValues) => {
  if (floatValue) {
    return floatValue > 1
      ? floatValue < Number.MAX_SAFE_INTEGER
      : floatValue > Number.MIN_SAFE_INTEGER;
  }
  return true;
};

interface Props extends TextInputProps {
  onChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  currency?: boolean;
}

const NumberInput: React.FC<Props> = ({
  inputProps,
  min = 0,
  max,
  InputProps,
  currency = false,
  value,
  error,
  helperText,
  ariaLabelledBy,
  onChange,
  ...props
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleBlur = () => {
    if (isNil(value) || value === '') {
      setErrorMessage(null);
      return;
    }

    let val: number;

    if (typeof value === 'string') {
      val = currency ? parseFloat(value) : parseInt(value);
    } else if (typeof value === 'number') {
      val = value;
    } else {
      setErrorMessage('Invalid Number');
      return;
    }

    if (!isFinite(val)) {
      setErrorMessage('Invalid Number');
    } else if (!isNil(min) && val < min) {
      setErrorMessage(`Must be greater than or equal to ${min}`);
    } else if (!isNil(max) && val > max) {
      setErrorMessage(`Must be less than or equal to ${max}`);
    } else {
      setErrorMessage(null);
    }
  };

  const decimalScale = currency ? 2 : 0;
  const prefix = currency ? '$' : undefined;

  const handleChange: OnValueChange = (v) => {
    const syntheticEvent = {
      target: {
        value: v.value,
        name: props.name, // If you have a name prop
      },
      // Add other event properties you might need
      preventDefault: () => {},
      stopPropagation: () => {},
    } as React.ChangeEvent<HTMLInputElement>;

    onChange(syntheticEvent);
  };

  return (
    <NumericFormat
      error={!!(error || errorMessage)}
      helperText={error ? undefined : errorMessage || helperText}
      customInput={TextInput}
      onValueChange={handleChange}
      onBlur={handleBlur}
      value={(value || '') as string}
      isAllowed={withValueLimit}
      thousandSeparator
      decimalScale={decimalScale}
      inputProps={{
        pattern: '[0-9]*', // hint mobile keyboards
        inputMode: 'numeric',
        min,
        max,
        'aria-labelledby': ariaLabelledBy,
        ...inputProps,
      }}
      placeholder={currency ? '0' : undefined}
      InputProps={{
        startAdornment: prefix ? (
          <InputAdornment position='start'>{prefix}</InputAdornment>
        ) : undefined,
        ...InputProps,
      }}
      {...(props as any)}
    />
  );
};

export default NumberInput;
