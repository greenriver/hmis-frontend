import {
  FormGroup,
  FormLabel,
  SxProps,
  Theme,
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonGroupProps,
} from '@mui/material';
import { isNil } from 'lodash-es';
import { useCallback, useId } from 'react';

import { horizontalInputSx } from './TextInput';

import { DynamicInputCommonProps } from '@/modules/form/components/DynamicField';
import { PickListOption } from '@/types/gqlTypes';

type Option = PickListOption;

interface Props extends ToggleButtonGroupProps {
  name?: string;
  horizontal?: boolean;
  options: Option[];
}
export type ToggleButtonGroupInputProps = Props & DynamicInputCommonProps;

const ToggleButtonGroupInput = ({
  label,
  options,
  horizontal = false,
  onChange,
  value,
  error,
  ...props
}: ToggleButtonGroupInputProps) => {
  const htmlId = useId();

  const handleChange = useCallback(
    (event: React.MouseEvent<HTMLElement, MouseEvent>, value: any) => {
      if (!onChange) return;
      if (isNil(value)) onChange(event, value);
      return onChange(
        event,
        options.find((o) => o.code === value)
      );
    },
    [onChange, options]
  );

  const buttonSx: SxProps<Theme> = {
    minWidth: 100,
    whiteSpace: 'pre',
    border: error
      ? (theme: Theme) => `1px solid ${theme.palette.error.main}`
      : undefined,
  };

  return (
    <FormGroup sx={horizontal ? horizontalInputSx : undefined}>
      <FormLabel
        id={htmlId}
        error={error}
        sx={{
          pr: horizontal ? 1 : undefined,
          backgroundColor: horizontal ? 'white' : undefined,
          color: horizontal ? 'text.primary' : undefined,
        }}
      >
        {label}
      </FormLabel>
      <ToggleButtonGroup
        exclusive
        aria-labelledby={htmlId}
        sx={{
          pt: 0.5,
          mt: 0.5,
          backgroundColor: horizontal ? 'white' : undefined,
        }}
        size='small'
        onChange={handleChange}
        value={value ? value.code : null}
        {...props}
      >
        {options.map(({ code, label }) => (
          <ToggleButton
            value={code}
            aria-label={label || code}
            color='secondary'
            sx={buttonSx}
            key={code}
          >
            {label || code}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </FormGroup>
  );
};

export default ToggleButtonGroupInput;
