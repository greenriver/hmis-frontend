import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormControlLabelProps,
  FormGroup,
  FormHelperText,
} from '@mui/material';
import { KeyboardEventHandler, SyntheticEvent, useCallback } from 'react';

import { horizontalInputSx } from './TextInput';

import { DynamicInputCommonProps } from '@/modules/form/types';

export interface Props
  extends Omit<FormControlLabelProps, 'control' | 'label'> {
  name?: string;
  horizontal?: boolean;
}

const LabeledCheckbox = ({
  label,
  error,
  onChange,
  helperText,
  horizontal = false,
  warnIfEmptyTreatment: _ignored,
  ariaLabel,
  ...props
}: Props & DynamicInputCommonProps) => {
  const labelSx = horizontal
    ? {
        justifyContent: 'space-between',
        width: '100%',
        ml: 0,
        '.MuiFormControlLabel-label': {
          pr: 1,
          backgroundColor: 'white',
        },
      }
    : undefined;
  const checkboxSx = horizontal
    ? // remove transparency from hover state so dashes are not exposed
      { backgroundColor: 'white', '&:hover': { backgroundColor: '#F7F9FD' } }
    : { '.MuiSvgIcon-root': { backgroundColor: 'white' } };

  // Prevent form submission on Enter. Enter should toggle the state.
  const onKeyDown: KeyboardEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const checked = (e.target as HTMLInputElement).checked;
        (e.target as HTMLInputElement).checked = !checked;
        if (onChange) onChange(e as SyntheticEvent, !checked);
      }
    },
    [onChange]
  );

  return (
    <FormControl>
      <FormGroup sx={horizontal ? horizontalInputSx : undefined}>
        <FormControlLabel
          control={
            <Checkbox
              sx={checkboxSx}
              onKeyDown={onKeyDown}
              aria-label={ariaLabel}
            />
          }
          labelPlacement={horizontal ? 'start' : 'end'}
          label={label}
          sx={{
            color: error ? 'error.main' : undefined,
            '.MuiCheckbox-root': {
              color: error ? 'error.main' : undefined,
            },
            ...labelSx,
          }}
          onChange={onChange}
          {...props}
        />
      </FormGroup>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default LabeledCheckbox;
