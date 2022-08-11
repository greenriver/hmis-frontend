import { Autocomplete, AutocompleteProps } from '@mui/material';
import React from 'react';

import TextInput, { TextInputProps } from './TextInput';

export interface GenericSelectProps<
  T,
  Multiple extends boolean | undefined,
  Creatable extends boolean | undefined
> extends Omit<
    AutocompleteProps<T, Multiple, boolean, Creatable, React.ElementType>,
    'renderInput'
  > {
  label?: string;
  textInputProps?: TextInputProps;
}

const GenericSelect = <
  T extends object,
  Multiple extends boolean | undefined,
  Creatable extends boolean | undefined
>({
  value,
  label,
  textInputProps,
  options,
  ...rest
}: GenericSelectProps<T, Multiple, Creatable>) => {
  const hasValue = (value: string | object | null | undefined) => {
    if (Array.isArray(value) && value.length == 0) return false;
    return value !== null && typeof value !== 'undefined';
  };

  const { placeholder, ...inputProps } = textInputProps || {};
  return (
    <Autocomplete
      options={options}
      value={value}
      renderInput={(params) => (
        <TextInput
          {...params}
          {...inputProps}
          disabled={rest.disabled}
          // Only render placeholder if no values are selected
          placeholder={hasValue(value) ? undefined : placeholder}
          label={label}
        />
      )}
      {...rest}
    />
  );
};

export default GenericSelect;
