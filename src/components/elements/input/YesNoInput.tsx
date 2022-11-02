import {
  FormGroup,
  FormLabel,
  Theme,
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonGroupProps,
} from '@mui/material';
import { isNil } from 'lodash-es';
import { useCallback, useId } from 'react';

import { DynamicInputCommonProps } from '@/modules/form/components/DynamicField';

interface Props extends ToggleButtonGroupProps {
  nullable?: boolean; // whether you can click again to remove the selection
  name?: string;
  trueLabel?: string;
  falseLabel?: string;
  nullOptionLabel?: string;
  includeNullOption?: boolean;
}
export type YesNoInputProps = Props & DynamicInputCommonProps;

const YesNoInput = ({
  label,
  nullable = true,
  includeNullOption = false,
  trueLabel = 'Yes',
  falseLabel = 'No',
  nullOptionLabel = "Don't Know",
  onChange,
  value,
  error,
  ...props
}: YesNoInputProps) => {
  const htmlId = useId();
  const handleChange = useCallback(
    (event: React.MouseEvent<HTMLElement, MouseEvent>, value: any) => {
      if (!onChange) return;
      if (!nullable && isNil(value)) return;
      return onChange(event, value === -1 ? null : value);
    },
    [onChange, nullable]
  );

  const buttonSx = {
    width: 100,
    border: error
      ? (theme: Theme) => `1px solid ${theme.palette.error.main}`
      : undefined,
  };
  return (
    <FormGroup>
      <FormLabel id={htmlId} error={error}>
        {label}
      </FormLabel>
      <ToggleButtonGroup
        exclusive
        aria-labelledby={htmlId}
        sx={{ pt: 0.5, mt: 0.5 }}
        size='small'
        onChange={handleChange}
        value={
          includeNullOption && isNil(value) && typeof value !== 'undefined'
            ? -1
            : value
        }
        {...props}
      >
        <ToggleButton
          value={true}
          aria-label={trueLabel}
          color='secondary'
          sx={buttonSx}
        >
          {trueLabel}
        </ToggleButton>
        <ToggleButton
          value={false}
          aria-label={falseLabel}
          color='secondary'
          sx={buttonSx}
        >
          {falseLabel}
        </ToggleButton>
        {includeNullOption && (
          <ToggleButton
            value={-1}
            aria-label={nullOptionLabel}
            color='secondary'
            sx={buttonSx}
          >
            {nullOptionLabel}
          </ToggleButton>
        )}
      </ToggleButtonGroup>
    </FormGroup>
  );
};

export default YesNoInput;
