import {
  TextField,
  TextFieldProps,
  InputLabelProps,
  InputProps,
  SelectProps,
} from '@mui/material';
import { useId } from 'react';

export type TextInputProps = Partial<
  Omit<TextFieldProps, 'error' | 'variant'>
> & {
  name?: string;
  label?: React.ReactNode;
};

const TextInput = ({
  inputProps = {},
  label,
  hiddenLabel = false,
  fullWidth = true,
  ...props
}: TextInputProps) => {
  const htmlId = useId();
  return (
    <TextField
      id={htmlId}
      fullWidth={fullWidth}
      label={hiddenLabel ? undefined : label}
      {...props}
      inputProps={{
        ...inputProps,
        'aria-label': hiddenLabel ? String(label) : undefined,
      }}
      InputProps={{
        ...(props.InputProps as InputProps),
        notched: false,
        sx: {
          'label + &': {
            mt: 3,
          },
          '& input[disabled]': {
            backgroundColor: 'text.disabled',
          },
        },
      }}
      InputLabelProps={{
        ...(props.InputLabelProps as InputLabelProps),
        hidden: hiddenLabel,
        shrink: true,
        variant: 'standard',
        sx: {
          transform: 'none',
          color: 'text.secondary',
          // FIXME: define typography variants and how each is used. talk to ash
          typography: 'body2',
        },
      }}
      SelectProps={props.SelectProps as SelectProps}
    />
  );
};

export default TextInput;
