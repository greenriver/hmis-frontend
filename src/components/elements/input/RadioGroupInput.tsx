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
import { isNil } from 'lodash-es';
import { KeyboardEventHandler, useCallback, useId } from 'react';

import { DynamicInputCommonProps } from '@/modules/form/components/DynamicField';
import { INVALID_ENUM } from '@/modules/hmis/hmisUtil';
import { PickListOption } from '@/types/gqlTypes';

type Option = PickListOption;

export interface Props extends Omit<RadioGroupProps, 'onChange'> {
  name?: string;
  options: Option[];
  onChange: (value: Option | null | undefined) => void;
  clearable?: boolean; // whether you can click again to clear the radio button value
  checkbox?: boolean; // display as exclusive checkbox group
}
export type RadioGroupInputProps = Props & DynamicInputCommonProps;

const InvalidValueCheckbox = ({
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
  checkbox = false,
  ...props
}: RadioGroupInputProps) => {
  const htmlId = useId();

  const onClickOption = useCallback(
    (
      event:
        | React.MouseEvent<HTMLLabelElement>
        | React.KeyboardEvent<HTMLButtonElement>,
      option: string
    ) => {
      event.preventDefault();
      if (isNil(option)) {
        onChange(option);
      } else if (clearable && option === value?.code) {
        onChange(null);
      } else {
        onChange(options.find((o) => o.code === option));
      }
    },
    [onChange, options, value, clearable]
  );

  // Prevent form submission on Enter. Enter should toggle the state.
  const onKeyDown: KeyboardEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space')
        onClickOption(e, (e.target as HTMLInputElement).value);
      // if (e.key.match(/(ArrowDown|ArrowUp|ArrowLeft|ArrowRight)/))
      //   e.preventDefault();
    },
    [onClickOption]
  );

  const GroupComponent = checkbox ? FormGroup : RadioGroup;
  const ControlComponent = checkbox ? Checkbox : Radio;

  return (
    <FormGroup>
      <FormControl>
        <FormLabel
          id={htmlId}
          error={error}
          sx={{
            color: props.disabled ? 'text.disabled' : 'text.primary',
            '&.Mui-focused': {
              color: 'text.primary',
            },
          }}
        >
          {label}
        </FormLabel>
        <GroupComponent
          row={row}
          aria-labelledby={htmlId}
          // value={value ? value.code : null}
          onChange={() => null}
          sx={{
            ...(!row && {
              'label:first-of-type': { pt: 1 },
              // 'label:last-child': { pb: 1 },
              'label .MuiRadio-root': { p: 1 },
            }),
            ...(warnIfEmptyTreatment && {
              svg: {
                backgroundColor: 'alerts.lightWarningBackground',
                borderRadius: 1,
              },
            }),
            ...sx,
          }}
          {...props}
        >
          {options.map(({ code, label }) => (
            <FormControlLabel
              data-testid={`option-${code}`}
              disabled={props.disabled}
              value={code}
              aria-label={label || code}
              onClick={(e) => onClickOption(e, code)}
              control={
                <ControlComponent
                  onKeyDown={onKeyDown}
                  data-checked={value?.code === code ? true : false}
                />
              }
              checked={value?.code === code ? true : false}
              key={code}
              label={label || code}
              componentsProps={{
                typography: {
                  variant: 'body2',
                  color:
                    checkbox && value && value?.code !== code
                      ? 'gray'
                      : undefined,
                },
              }}
            />
          ))}
          {value?.code === INVALID_ENUM && (
            <InvalidValueCheckbox control={<ControlComponent data-checked />} />
          )}
        </GroupComponent>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    </FormGroup>
  );
};

export default RadioGroupInput;
