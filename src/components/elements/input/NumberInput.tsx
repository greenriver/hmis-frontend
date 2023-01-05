import { Box } from '@mui/system';
import { isFinite, isNil } from 'lodash-es';
import { useState } from 'react';

import TextInput, { TextInputProps } from './TextInput';

const NumberInput = ({
  inputProps,
  min = 0,
  max,
  InputProps,
  currency,
  value,
  error,
  ...props
}: TextInputProps & { currency?: boolean }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currencyInputProps = currency
    ? {
        startAdornment: <Box sx={{ color: 'text.secondary', pr: 1 }}>$</Box>,
        sx: {
          pl: 1,
          '.MuiInputBase-input': { textAlign: 'left' },
        },
      }
    : {};

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

  return (
    <TextInput
      type='number'
      inputProps={{
        inputMode: 'numeric',
        pattern: '[0-9]*',
        min,
        max,
        ...inputProps,
      }}
      InputProps={{ ...currencyInputProps, ...InputProps }}
      onBlur={handleBlur}
      value={value}
      {...props}
      error={error || !!errorMessage}
      // If there is a server error, show that instead of the local message
      helperText={error ? undefined : errorMessage || props.helperText}
    />
  );
};

export default NumberInput;
