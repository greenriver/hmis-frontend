import { Box } from '@mui/system';

import TextInput, { TextInputProps } from './TextInput';

const NumberInput = ({
  inputProps,
  min,
  max,
  InputProps,
  currency,
  ...props
}: TextInputProps & { currency?: boolean }) => {
  const currencyInputProps = currency
    ? {
        startAdornment: <Box sx={{ color: 'text.secondary', pr: 1 }}>$</Box>,
        sx: {
          pl: 1,
          '.MuiInputBase-input': { textAlign: 'left' },
        },
      }
    : {};
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
      {...props}
    />
  );
};

export default NumberInput;
