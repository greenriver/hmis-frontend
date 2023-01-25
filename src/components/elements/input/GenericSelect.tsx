import {
  Autocomplete,
  AutocompleteProps,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import React, { ReactNode } from 'react';

import TextInput, { TextInputProps } from './TextInput';

export interface GenericSelectProps<
  T,
  Multiple extends boolean | undefined,
  Creatable extends boolean | undefined
> extends Omit<
    AutocompleteProps<T, Multiple, boolean, Creatable, React.ElementType>,
    'renderInput'
  > {
  label?: ReactNode;
  textInputProps?: TextInputProps;
}

const GenericSelect = <
  T extends string | object,
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

  // Show a loading indicator if we have a value but the picklist is still loading
  const startAdornment =
    rest.loading && hasValue(value) ? (
      <InputAdornment position='start' sx={{ pl: 1 }}>
        <CircularProgress size={15} color='inherit' />
      </InputAdornment>
    ) : undefined;

  return (
    <Autocomplete
      options={options}
      value={value}
      disableCloseOnSelect={!!rest.multiple}
      renderInput={(params) => (
        <TextInput
          {...params}
          {...inputProps}
          InputProps={{
            ...params.InputProps,
            ...(startAdornment ? { startAdornment } : undefined),
            ...inputProps.InputProps,
          }}
          InputLabelProps={{
            ...params.InputLabelProps,
            ...inputProps.InputLabelProps,
          }}
          inputProps={{
            ...params.inputProps,
            value: rest.loading ? '' : params.inputProps.value,
            ...inputProps.inputProps,
          }}
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
