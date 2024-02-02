import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
} from '@mui/material';
import React from 'react';

import { DynamicInputCommonProps } from '@/modules/form/types';
import { PickListOption } from '@/types/gqlTypes';

type Option = PickListOption;

export interface Props {
  value?: Option[] | null;
  name?: string;
  options: Option[];
  onChange: (value?: Option[] | null) => void;
  row?: boolean;
}
export type CheckboxGroupInputProps = Props & DynamicInputCommonProps;

const CheckboxGroupInput: React.FC<CheckboxGroupInputProps> = ({
  options,
  value,
  onChange,
  label,
  helperText,
  disabled,
  error,
  row,
  warnIfEmptyTreatment,
}) => {
  const isChecked = (code: string) =>
    (value || []).map((o) => o.code).includes(code);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = options.find((o) => o.code === event.target.name);
    if (!selected) return;
    if (!isChecked(selected.code)) {
      onChange([...(value || []), selected]);
    } else {
      onChange((value || []).filter((o) => o.code !== selected.code));
    }
  };

  return (
    <>
      <FormControl component='fieldset' variant='standard'>
        {label && (
          <FormLabel
            error={error}
            component='legend'
            disabled={disabled}
            sx={{
              color: disabled ? 'text.disabled' : 'text.primary',
              '&.Mui-focused': { color: 'text.primary' },
            }}
          >
            {label}
          </FormLabel>
        )}
        <FormGroup
          row={row}
          sx={{
            ...(!row && {
              'label:first-of-type': { pt: 1 },
              '.MuiCheckbox-root': { py: 0.5 },
            }),
            ...(warnIfEmptyTreatment && {
              '[data-checked="false"] svg': {
                backgroundColor: 'alerts.low.background',
                borderRadius: 1,
              },
            }),
          }}
        >
          {options.map(({ code, label }) => (
            <FormControlLabel
              data-testid={`option-${code}`}
              disabled={disabled}
              value={code}
              key={code}
              label={label || code}
              control={
                <Checkbox
                  checked={isChecked(code)}
                  data-checked={isChecked(code)}
                  onChange={handleChange}
                  name={code || label || 'option'}
                />
              }
              componentsProps={{ typography: { variant: 'body2', mr: 0.5 } }}
            />
          ))}
        </FormGroup>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    </>
  );
};

export default CheckboxGroupInput;
