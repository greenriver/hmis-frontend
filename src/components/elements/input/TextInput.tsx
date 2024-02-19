import {
  Box,
  InputLabel,
  InputLabelProps,
  InputProps,
  SelectProps,
  Stack,
  SxProps,
  TextField,
  TextFieldProps,
  Theme,
} from '@mui/material';
import { useId } from 'react';

import { DynamicInputCommonProps } from '@/modules/form/types';
import { formAutoCompleteOff } from '@/modules/form/util/formUtil';

interface Props extends Partial<Omit<TextFieldProps, 'error' | 'variant'>> {
  name?: string;
  highlight?: boolean; // toggle highlight state
  horizontal?: boolean;
  inputWidth?: string | number;
}
export type TextInputProps = Props & DynamicInputCommonProps;

export const horizontalInputSx: SxProps<Theme> = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const TextInput = ({
  inputProps = {},
  label,
  hiddenLabel = false,
  fullWidth = true,
  horizontal = false,
  min,
  max,
  highlight,
  inputWidth,
  sx,
  warnIfEmptyTreatment,
  ariaLabelledBy,
  id,
  ...props
}: TextInputProps) => {
  const generatedId = useId();
  const htmlId = id || generatedId;

  let width = inputWidth;
  if (!width && inputProps.inputMode === 'numeric') {
    width = '120px';
  }

  const textField = (
    <TextField
      id={htmlId}
      fullWidth={fullWidth}
      label={hiddenLabel || horizontal ? undefined : label}
      onKeyDown={(e) =>
        !props.multiline && e.key === 'Enter' && e.preventDefault()
      }
      autoComplete={formAutoCompleteOff}
      {...props}
      sx={sx}
      inputProps={{
        'aria-label': hiddenLabel ? String(label) : undefined,
        'aria-labelledby': ariaLabelledBy,
        minLength: min,
        maxLength: max,
        ...inputProps,
      }}
      InputProps={{
        ...(props.InputProps as InputProps),
        notched: false,
        sx: {
          'label + &': {
            mt: 0.5,
          },
          backgroundColor: warnIfEmptyTreatment
            ? 'alerts.low.background'
            : undefined,
          width,
          minWidth: width,
          boxShadow: highlight
            ? (theme) => `0 0 8px ${theme.palette.warning.main}`
            : undefined,
          borderRadius: highlight ? '5px' : undefined,
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
          color: 'text.primary',
          typography: props.size === 'medium' ? 'body1' : 'body2',
          position: 'relative',
          whiteSpace: 'break-spaces',
          display: 'flex',
          alignItems: 'center',
          fontWeight: 600,
          // backgroundColor: horizontal ? 'white' : undefined,
          pr: horizontal ? 1 : undefined,
          ...(props.InputLabelProps?.sx || {}),
        },
      }}
      SelectProps={props.SelectProps as SelectProps}
    />
  );

  if (horizontal) {
    return (
      <Stack
        sx={{
          ...horizontalInputSx,
          '.MuiFormHelperText-root':
            inputProps.inputMode === 'numeric' ? { width, mr: 0 } : {},
        }}
        justifyContent='space-between'
      >
        <Box sx={{ flexBasis: '80%' }}>
          <InputLabel
            sx={(theme) => ({
              color: theme.palette.text.primary,
              fontSize: theme.typography.body2,
            })}
            htmlFor={htmlId}
          >
            {label}
          </InputLabel>
        </Box>
        <Box sx={{ justifyContent: 'flex-end', pt: 0.5 }}>{textField}</Box>
      </Stack>
    );
  }
  return textField;
};

export default TextInput;
