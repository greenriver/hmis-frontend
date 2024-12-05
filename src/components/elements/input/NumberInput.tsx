import { Box } from '@mui/system';
import { isFinite, isNil } from 'lodash-es';
import {
  KeyboardEventHandler,
  useCallback,
  useState,
  WheelEventHandler,
} from 'react';

import TextInput, { TextInputProps } from './TextInput';

const NumberInput = ({
  inputProps,
  min = 0,
  max,
  InputProps,
  currency = false,
  disableArrowKeys = false,
  value,
  error,
  ariaLabelledBy,
  ...props
}: TextInputProps & { currency?: boolean; disableArrowKeys?: boolean }) => {
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

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      const currentValue = event.currentTarget.value || '';
      const selectionStart = event.currentTarget.selectionStart;
      const key = event.key;

      // Handle arrow keys first
      if (key.match(/(ArrowDown|ArrowUp)/)) {
        if (disableArrowKeys) event.preventDefault();
        return;
      }

      // Allow all other special keys (Tab, Delete, etc.)
      if (key.length > 1) return;

      // Build what the value would be if we allow this keypress
      const beforeCursor = currentValue.substring(0, selectionStart || 0);
      const afterCursor = currentValue.substring(selectionStart || 0);
      const newValue = beforeCursor + key + afterCursor;

      // Always allow empty string and single minus at start
      if (newValue === '' || newValue === '-') return;

      // Prevent invalid keypresses
      if (
        // Invalid characters
        !key.match(/^[0-9.-]$/) ||
        // Multiple decimal points
        (key === '.' && currentValue.includes('.')) ||
        // Minus sign not at start
        (key === '-' && selectionStart !== 0) ||
        // Invalid number
        isNaN(Number(newValue)) ||
        !isFinite(Number(newValue))
      ) {
        event.preventDefault();
      }
    },
    [disableArrowKeys]
  );

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

  const preventValueChangeOnScroll: WheelEventHandler<HTMLDivElement> =
    useCallback((e) => {
      // Prevent the input value change
      (e.target as HTMLInputElement).blur();

      // Prevent the page/container scrolling
      e.stopPropagation();

      // Refocus immediately, on the next tick (after the current
      // function is done)
      setTimeout(() => {
        (e.target as HTMLInputElement).focus();
      }, 0);
    }, []);

  return (
    <TextInput
      type='text'
      inputProps={{
        inputMode: 'numeric',
        min,
        max,
        onKeyDown: handleKeyDown,
        'aria-labelledby': ariaLabelledBy,
        ...inputProps,
      }}
      onWheel={preventValueChangeOnScroll}
      InputProps={{ ...currencyInputProps, ...InputProps }}
      onBlur={handleBlur}
      value={value}
      placeholder={currency ? '0' : undefined}
      {...props}
      error={error || !!errorMessage}
      // If there is a server error, show that instead of the local message
      helperText={error ? undefined : errorMessage || props.helperText}
    />
  );
};

export default NumberInput;
