import {
  TextField,
  TextFieldProps,
  InputLabelProps,
  InputProps,
  SelectProps,
} from '@mui/material';
import { useId } from 'react';

import { DynamicInputCommonProps } from '@/modules/form/types';

interface Props extends Partial<Omit<TextFieldProps, 'error' | 'variant'>> {
  name?: string;
}
export type TextInputProps = Props & DynamicInputCommonProps;

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
      onKeyPress={(e) =>
        !props.multiline && e.key === 'Enter' && e.preventDefault()
      }
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
            mt: 0.5,
          },
          ...(props.InputProps?.sx || {}),
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
          typography: 'body2',
          position: 'relative',
          whiteSpace: 'break-spaces',
          ...(props.InputLabelProps?.sx || {}),
        },
      }}
      SelectProps={props.SelectProps as SelectProps}
    />
  );
};

export default TextInput;
