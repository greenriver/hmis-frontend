import {
  Autocomplete,
  AutocompleteProps,
  Chip,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import React, { ReactNode } from 'react';

import TextInput, { TextInputProps } from './TextInput';

import { hasMeaningfulValue } from '@/modules/form/util/formUtil';

export interface GenericSelectProps<
  T,
  Multiple extends boolean | undefined,
  Creatable extends boolean | undefined,
> extends Omit<
  AutocompleteProps<T, Multiple, boolean, Creatable, React.ElementType>,
  'renderInput'
> {
  label?: ReactNode;
  textInputProps?: TextInputProps;
  ariaLabel?: string;
  color?: 'warning' | 'error';
}

const GenericSelect = <
  T extends string | object,
  Multiple extends boolean | undefined,
  Creatable extends boolean | undefined,
>({
  value,
  label,
  textInputProps,
  options,
  ariaLabel,
  color,
  ...rest
}: GenericSelectProps<T, Multiple, Creatable>) => {
  const { placeholder, ...inputProps } = textInputProps || {};
  // Show a loading indicator if we have a value but the picklist is still loading
  const startAdornment =
    rest.loading && hasMeaningfulValue(value) ? (
      <InputAdornment position='start' sx={{ pl: 1 }}>
        <CircularProgress
          size={15}
          color={color === 'warning' || color === 'error' ? color : 'inherit'}
        />
      </InputAdornment>
    ) : undefined;

  return (
    <Autocomplete
      options={options}
      value={value}
      renderInput={(params) => (
        <TextInput
          {...params}
          {...inputProps}
          InputProps={{
            ...params.InputProps,
            ...(startAdornment ? { startAdornment } : undefined),
            ...inputProps.InputProps,
            sx: {
              ...(color && {
                backgroundColor: `${color}.100`,
                '& .MuiInputAdornment-root': {
                  color: `${color}.dark`,
                },
              }),
              ...(inputProps.InputProps?.sx || {}),
            },
          }}
          InputLabelProps={{
            ...params.InputLabelProps,
            ...inputProps.InputLabelProps,
            sx: {
              ...(color && {
                color: `${color}.dark`,
                '&.Mui-focused': {
                  color: `${color}.dark`,
                },
              }),
              ...(inputProps.InputLabelProps?.sx || {}),
            },
          }}
          inputProps={{
            ...params.inputProps,
            value: rest.loading ? '' : params.inputProps.value,
            ...inputProps.inputProps,
            'aria-label': ariaLabel,
          }}
          disabled={rest.disabled}
          // Only render placeholder if no values are selected
          placeholder={hasMeaningfulValue(value) ? undefined : placeholder}
          label={label}
        />
      )}
      renderTags={(tagValue, getTagProps, ownerState) =>
        // Augment the accessible text so that it's clear to screenreader users how they can remove options.
        // Relates to open MUI issue: https://github.com/mui/material-ui/issues/20470
        tagValue.map((option: T, index: number) => {
          // Avoid console warning: A props object containing a "key" prop is being spread into JSX
          const { key, ...rest } = getTagProps({ index });

          // If the value is an object with a 'disabled' property set to true, disable the chip from being unselected
          const disabled =
            (typeof option === 'object' &&
              option !== null &&
              'disabled' in option &&
              (option as any).disabled) ||
            rest.disabled;

          return (
            <Chip
              key={key}
              size='small'
              label={ownerState.getOptionLabel(option)}
              aria-label={`Option: ${ownerState.getOptionLabel(option)}. Press backspace or delete to remove.`}
              aria-disabled={disabled ? 'true' : undefined}
              {...rest}
              disabled={disabled}
            />
          );
        })
      }
      {...rest}
    />
  );
};

export default GenericSelect;
