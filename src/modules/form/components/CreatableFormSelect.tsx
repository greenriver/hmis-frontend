import { createFilterOptions, Typography } from '@mui/material';
import { useCallback } from 'react';

import { DynamicInputCommonProps } from '../types';

import GenericSelect, {
  GenericSelectProps,
} from '@/components/elements/input/GenericSelect';
import { findOptionLabel } from '@/modules/form/util/formUtil';
import { PickListOption } from '@/types/gqlTypes';

interface CreatableOption extends PickListOption {
  customOptionLabel?: string;
}
type Option = PickListOption & CreatableOption;

const optionId = (option: Option): string => {
  return option.code || '';
};

const optionLabel = (option: Option | string, forMenu = false): string => {
  // Value selected with enter, right from the input
  if (typeof option === 'string') {
    return option;
  }
  // Value select from clicking "Add 'xyz'" in menu
  if (forMenu && option.customOptionLabel) {
    return option.customOptionLabel;
  }

  return option.label || option.code || '';
};

const renderOption = (props: object, option: Option) => (
  <li {...props} key={optionId(option)}>
    <Typography variant='body2'>{optionLabel(option, true)}</Typography>
  </li>
);

const filter = createFilterOptions<Option>();

const transformSelectedValue = (
  value: Option | string | null
): Option | null => {
  if (value === null) return null;
  if (typeof value === 'string') return { code: value };
  return value;
};

const CreatableFormSelect = <Multiple extends boolean | undefined>({
  multiple,
  label = multiple ? 'Organizations' : 'Organization',
  options,
  onChange,
  error,
  placeholder,
  helperText,
  warnIfEmptyTreatment,
  ariaLabelledBy,
  ariaLabel,
  inputWidth,
  maxWidth,
  sx,
  ...props
}: GenericSelectProps<Option, Multiple, boolean> & DynamicInputCommonProps) => {
  const isGrouped = !!options[0]?.groupLabel;
  const openchoice = true;

  const getOptionLabel = useCallback(
    (option: Option | string, forMenu = false): string => {
      // Value selected with enter, right from the input
      if (typeof option === 'string') {
        return option;
      }
      // Value select from clicking "Add 'xyz'" in menu
      if (forMenu && option.customOptionLabel) {
        return option.customOptionLabel;
      }

      // Value selected by clicking an existing option, or initial option
      return findOptionLabel(option, options);
    },
    [options]
  );

  return (
    <GenericSelect
      getOptionLabel={getOptionLabel}
      label={label}
      multiple={multiple}
      options={options}
      renderOption={renderOption}
      groupBy={isGrouped ? (option) => option.groupLabel || '' : undefined}
      isOptionEqualToValue={(option, value) =>
        optionId(option) === optionId(value) ||
        optionId(option) === optionLabel(value)
      }
      selectOnFocus={!!openchoice}
      clearOnBlur={!!openchoice}
      handleHomeEndKeys={!!openchoice}
      forcePopupIcon={!!openchoice}
      freeSolo
      filterOptions={
        openchoice
          ? (options, params) => {
              const filtered = filter(options, params);
              const { inputValue } = params;
              // Suggest the creation of a new value
              const isExisting = options.some(
                (option) => inputValue === optionId(option)
              );
              if (inputValue !== '' && !isExisting) {
                filtered.push({
                  customOptionLabel: `Add "${inputValue}"`,
                  code: inputValue,
                });
              }

              return filtered;
            }
          : undefined
      }
      sx={{ ...sx, maxWidth }}
      {...props}
      textInputProps={{
        ...props.textInputProps,
        helperText,
        placeholder,
        error,
        warnIfEmptyTreatment,
        ariaLabelledBy,
        ariaLabel,
        inputWidth,
      }}
      onChange={
        onChange
          ? (event, newValue, ...rest) => {
              if (Array.isArray(newValue)) {
                const modified = newValue
                  .map(transformSelectedValue)
                  .flatMap((f) => (!!f ? [f] : []));
                // @ts-expect-error figure out AutocompleteValue
                onChange(event, modified, ...rest);
              } else {
                // @ts-expect-error figure out AutocompleteValue
                onChange(event, transformSelectedValue(newValue), ...rest);
              }
            }
          : undefined
      }
    />
  );
};

export default CreatableFormSelect;
