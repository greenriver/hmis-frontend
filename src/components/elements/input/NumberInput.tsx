import { InputAdornment } from '@mui/material';
import { isFinite, isNil } from 'lodash-es';
import { ChangeEventHandler, useEffect, useState } from 'react';

import {
  NumberFormatValues,
  NumericFormat,
  OnValueChange,
} from 'react-number-format';
import TextInput, { TextInputProps } from './TextInput';
import { preventImplicitSubmission } from '@/utils/forms';

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
  defaultValue,
  type,
  ...props
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleBlur = () => {
    if (isNil(value) || value === '') {
      setErrorMessage(null);
      return;
    }
  };

  useEffect(() => {
    let parsed: number;

    if (!value) {
      setErrorMessage(null);
      return;
    }

    if (typeof value === 'string') {
      parsed = currency ? parseFloat(value) : parseInt(value);
    } else if (typeof value === 'number') {
      parsed = value;
    } else {
      setErrorMessage('Invalid Number');
      return;
    }

    if (!isFinite(parsed)) {
      setErrorMessage('Invalid Number');
    } else if (!isNil(min) && parsed < min) {
      setErrorMessage(`Must be greater than or equal to ${min}`);
    } else if (!isNil(max) && parsed > max) {
      setErrorMessage(`Must be less than or equal to ${max}`);
    } else {
      setErrorMessage(null);
    }
  }, [value, min, max, currency]);

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
      // only use thousand separator for currency, not other integer fields which may represent 'Year'
      thousandSeparator={currency}
      decimalScale={decimalScale}
      inputProps={{
        pattern: '[0-9]*', // hint mobile keyboards
        inputMode: 'numeric',
        min,
        max,
        'aria-labelledby': ariaLabelledBy,
        onKeyDown: preventImplicitSubmission,
        ...inputProps,
      }}
      placeholder={currency ? '0' : undefined}
      InputProps={{
        startAdornment: prefix ? (
          <InputAdornment position='start'>{prefix}</InputAdornment>
        ) : undefined,
        ...InputProps,
      }}
      defaultValue={(defaultValue || '') as string}
      type={type as any}
      {...props}
    />
  );
};

export default NumberInput;
