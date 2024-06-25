import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormControlLabelProps,
  FormGroup,
  FormHelperText,
} from '@mui/material';
import {
  KeyboardEventHandler,
  Ref,
  SyntheticEvent,
  useCallback,
  useMemo,
} from 'react';

import { horizontalInputSx } from './TextInput';

import { DynamicInputCommonProps } from '@/modules/form/types';

export interface Props
  extends Omit<FormControlLabelProps, 'control' | 'label'>,
    DynamicInputCommonProps {
  name?: string;
  horizontal?: boolean;
  inputRef?: Ref<HTMLInputElement>;
}

const LabeledCheckbox = ({
  label,
  error,
  onChange,
  helperText,
  horizontal = false,
  warnIfEmptyTreatment: _ignored,
  ariaLabel,
  inputWidth,
  maxWidth,
  inputRef,
  ...props
}: Props) => {
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

  // Determine the checked state based on the value OR checked prop
  const checked = useMemo(() => {
    if (props.checked !== undefined) {
      return props.checked;
    }
    if (props.value !== undefined) {
      return !!props.value;
    }
    return;
  }, [props.checked, props.value]);

  return (
    <FormControl>
      <FormGroup sx={horizontal ? horizontalInputSx : undefined}>
        <FormControlLabel
          control={
            <Checkbox
              sx={{ width: inputWidth, ...checkboxSx }}
              onKeyDown={onKeyDown}
              aria-label={ariaLabel}
              inputRef={inputRef}
            />
          }
          labelPlacement={horizontal ? 'start' : 'end'}
          label={label}
          sx={{
            color: error ? 'error.main' : undefined,
            '.MuiCheckbox-root': {
              color: error ? 'error.main' : undefined,
            },
            maxWidth,
            ...labelSx,
          }}
          onChange={onChange}
          {...props}
          checked={checked}
        />
      </FormGroup>
      {helperText && (
        <FormHelperText error={!!error}>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

export default LabeledCheckbox;
