import { Autocomplete, AutocompleteProps } from '@mui/material';
import React from 'react';

import TextInput, { TextInputProps } from './TextInput';

export interface Option {
  readonly id: string;
}

export interface GenericSelectProps<T>
  extends Omit<
    AutocompleteProps<T, boolean, undefined, undefined, React.ElementType>,
    'onChange' | 'renderInput' | 'value' | 'options'
  > {
  value: T[] | T | null;
  options: T[];
  onChange: (option: T[] | T | null) => void;
  label?: string;
  textInputProps?: TextInputProps;
}

const GenericSelect = <T extends Option>({
  value,
  onChange,
  label,
  textInputProps,
  options,
  ...rest
}: GenericSelectProps<T>) => {
  const hasValue = (value: T[] | T | null) => {
    if (Array.isArray(value) && value.length == 0) return false;
    return value !== null && typeof value !== 'undefined';
  };

  const { placeholder, ...inputProps } = textInputProps || {};
  return (
    <Autocomplete
      options={options}
      value={value}
      onChange={(_, selected) => onChange(selected)}
      renderInput={(params) => (
        <TextInput
          {...params}
          {...inputProps}
          // Only render placeholder if no values are selected
          placeholder={hasValue(value) ? undefined : placeholder}
          label={label}
        />
      )}
      isOptionEqualToValue={(option: T, value: T) => option.id === value.id}
      {...rest}
    />
  );
};

export default GenericSelect;
