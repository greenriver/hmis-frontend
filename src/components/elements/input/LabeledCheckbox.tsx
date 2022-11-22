import {
  Checkbox,
  FormControlLabel,
  FormControlLabelProps,
  FormGroup,
} from '@mui/material';
import { KeyboardEventHandler, SyntheticEvent, useCallback } from 'react';

import { horizontalInputSx } from './TextInput';

import { DynamicInputCommonProps } from '@/modules/form/components/DynamicField';

export interface Props
  extends Omit<FormControlLabelProps, 'control' | 'label'> {
  name?: string;
  horizontal?: boolean;
}

const LabeledCheckbox = ({
  label,
  error,
  onChange,
  horizontal = false,
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
    <FormGroup sx={horizontal ? horizontalInputSx : undefined}>
      <FormControlLabel
        control={<Checkbox sx={checkboxSx} onKeyDown={onKeyDown} />}
        labelPlacement={horizontal ? 'start' : 'end'}
        label={label}
        sx={{
          color: error ? (theme) => theme.palette.error.main : undefined,
          '.MuiCheckbox-root': {
            color: error ? (theme) => theme.palette.error.main : undefined,
          },
          ...labelSx,
        }}
        onChange={onChange}
        {...props}
      />
    </FormGroup>
  );
};

export default LabeledCheckbox;
