import {
  Box,
  InputLabelProps,
  InputProps,
  SelectProps,
  Stack,
  SxProps,
  TextField,
  TextFieldProps,
  Theme,
  Typography,
} from '@mui/material';
import { useId } from 'react';

import { DynamicInputCommonProps } from '@/modules/form/components/DynamicField';

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

  // backgroundImage: (theme: Theme) =>
  // `linear-gradient(to right, ${theme.palette.grey[200]} 33%, rgba(255,255,255,0) 0%)`,
  // backgroundPosition: 'center',
  // backgroundSize: '8px 3px',
  // backgroundRepeat: 'repeat-x',
  // flexWrap: 'nowrap',
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
  ...props
}: TextInputProps) => {
  const htmlId = useId();

  let width = inputWidth;
  if (!width && inputProps.inputMode === 'numeric') {
    width = '120px';
  }

  const textField = (
    <TextField
      id={htmlId}
      fullWidth={fullWidth}
      label={hiddenLabel || horizontal ? undefined : label}
      onKeyPress={(e) =>
        !props.multiline && e.key === 'Enter' && e.preventDefault()
      }
      {...props}
      sx={sx}
      inputProps={{
        ...inputProps,
        minLength: min,
        maxLength: max,
        'aria-label': hiddenLabel ? String(label) : undefined,
      }}
      InputProps={{
        ...(props.InputProps as InputProps),
        notched: false,
        sx: {
          'label + &': {
            mt: 0.5,
          },
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
          typography: 'body2',
          position: 'relative',
          whiteSpace: 'break-spaces',
          display: 'flex',
          alignItems: 'center',
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
        <Typography sx={{ flexBasis: '80%' }}>{label}</Typography>
        <Box sx={{ justifyContent: 'flex-end', pt: 0.5 }}>{textField}</Box>
      </Stack>
    );
  }
  return textField;
};

export default TextInput;
