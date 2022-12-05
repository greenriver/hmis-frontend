import {
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Radio,
  RadioGroup,
  RadioGroupProps,
} from '@mui/material';
import { isNil } from 'lodash-es';
import { KeyboardEventHandler, useCallback, useId } from 'react';

import { DynamicInputCommonProps } from '@/modules/form/components/DynamicField';
import { PickListOption } from '@/types/gqlTypes';

type Option = PickListOption;

interface Props extends Omit<RadioGroupProps, 'onChange'> {
  name?: string;
  options: Option[];
  onChange: (value: Option | null | undefined) => void;
}
export type RadioButtonInputProps = Props & DynamicInputCommonProps;

const RadioButtonInput = ({
  label,
  options,
  onChange,
  value,
  error,
  ...props
}: RadioButtonInputProps) => {
  const htmlId = useId();

  const onChangeOption = useCallback(
    (_e: any, value: any) => {
      if (isNil(value)) {
        onChange(value);
      } else {
        onChange(options.find((o) => o.code === value));
      }
    },
    [onChange, options]
  );

  // Prevent form submission on Enter. Enter should toggle the state.
  const onKeyDown: KeyboardEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onChangeOption(e, e.target.value);
      }
    },
    [onChangeOption]
  );

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
        <RadioGroup
          row
          aria-labelledby={htmlId}
          value={value ? value.code : null}
          onChange={onChangeOption}
          {...props}
        >
          {options.map(({ code, label }) => (
            <FormControlLabel
              disabled={props.disabled}
              value={code}
              aria-label={label || code}
              control={<Radio onKeyDown={onKeyDown} />}
              key={code}
              label={label || code}
              componentsProps={{ typography: { variant: 'body2' } }}
            />
          ))}
        </RadioGroup>
      </FormControl>
    </FormGroup>
  );
};

export default RadioButtonInput;
