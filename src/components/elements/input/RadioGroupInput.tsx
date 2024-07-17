import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  RadioGroupProps,
} from '@mui/material';
import { SxProps } from '@mui/system';
import { useCallback } from 'react';

import RadioGroupInputOption from '@/components/elements/input/RadioGroupInputOption';
import { DynamicInputCommonProps } from '@/modules/form/types';
import { INVALID_ENUM } from '@/modules/hmis/hmisUtil';
import { PickListOption } from '@/types/gqlTypes';

export interface Props extends Omit<RadioGroupProps, 'onChange'> {
  name?: string;
  options: PickListOption[];
  onChange: (value: PickListOption | null | undefined) => void;
  clearable?: boolean; // whether you can click again to clear the radio button value
  checkbox?: boolean; // display as exclusive checkbox group
  labelSx?: SxProps;
}
export type RadioGroupInputProps = Props & DynamicInputCommonProps;

export const InvalidValueCheckbox = ({
  control,
}: {
  control: React.ReactElement<any, any>;
}) => (
  <FormControlLabel
    data-testid={`option-invalid`}
    disabled={true}
    value='invalid'
    aria-label='invalid option'
    control={control}
    checked
    key='invalid'
    label='Invalid value'
    sx={{
      '.MuiFormControlLabel-label.Mui-disabled': {
        color: 'error.dark',
      },
      '.MuiCheckbox-root.Mui-disabled': {
        color: 'error.main',
      },
    }}
    componentsProps={{
      typography: {
        variant: 'body2',
      },
    }}
  />
);

const RadioGroupInput = ({
  label,
  options,
  onChange,
  value,
  error,
  warnIfEmptyTreatment,
  row,
  sx,
  clearable,
  helperText,
  ariaLabel,
  checkbox = false,
  maxWidth,
  inputWidth,
  labelSx,
  ...props
}: RadioGroupInputProps) => {
  const onClickOption = useCallback(
    (option: PickListOption) => {
      if (props.disabled) return;

      if (clearable && option.code === value?.code) {
        onChange(null);
      } else {
        onChange(option);
      }
    },
    [onChange, value, clearable, props.disabled]
  );

  const GroupComponent = checkbox ? FormGroup : RadioGroup;
  const ControlComponent = checkbox ? Checkbox : Radio;

  return (
    <FormControl component='fieldset' sx={{ maxWidth, ...sx }}>
      <FormLabel
        error={error}
        disabled={props.disabled}
        component='legend'
        sx={{
          float: 'left', //unsets default 'legend' styles
          color: props.disabled ? 'text.disabled' : 'text.primary',
          '&.Mui-focused': {
            color: 'text.primary',
          },
          ...labelSx,
        }}
      >
        {label}
      </FormLabel>
      <GroupComponent
        row={row}
        onChange={() => null}
        sx={{
          width: inputWidth,
          ...(!row && {
            'label:first-of-type': { pt: 0.5 },
            // 'label:last-child': { pb: 1 },
            'label .MuiRadio-root': { py: 0.5 },
          }),
          ...(warnIfEmptyTreatment && {
            '[data-checked="false"] svg': {
              backgroundColor: 'alerts.low.background',
              borderRadius: 1,
            },
          }),
        }}
        aria-label={ariaLabel}
        {...props}
      >
        {options.map((option) => (
          <RadioGroupInputOption
            key={option.code}
            option={option}
            disabled={props.disabled}
            onChange={onClickOption}
            variant={checkbox ? 'checkbox' : 'radio'}
            value={value?.code}
            row={row}
          />
        ))}
        {value?.code === INVALID_ENUM && (
          <InvalidValueCheckbox control={<ControlComponent data-checked />} />
        )}
      </GroupComponent>
      {helperText && (
        <FormHelperText error={error}>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

export default RadioGroupInput;
