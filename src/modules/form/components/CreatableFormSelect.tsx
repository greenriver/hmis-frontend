import { Typography, createFilterOptions } from '@mui/material';

import { AnswerOption, DynamicInputCommonProps } from '../types';

import GenericSelect, {
  GenericSelectProps,
} from '@/components/elements/input/GenericSelect';

interface CreatableOption extends AnswerOption {
  customOptionLabel?: string;
}
type Option = AnswerOption & CreatableOption;

const optionId = (option: Option): string => {
  if (option.valueCoding) {
    return option.valueCoding.code;
  }
  return option.valueString || '';
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

  if (option.valueCoding) {
    return option.valueCoding.display || option.valueCoding.code;
  }
  return option.valueString || '';
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
  if (typeof value === 'string') return { valueString: value };
  return value;
};

const CreatableFormSelect = <Multiple extends boolean | undefined>({
  multiple,
  label = multiple ? 'Organizations' : 'Organization',
  options,
  onChange,
  error,
  ...props
}: GenericSelectProps<Option, Multiple, boolean> & DynamicInputCommonProps) => {
  const isGrouped = !!options[0]?.valueCoding?.displayGroup;
  const openchoice = true;
  return (
    <GenericSelect
      getOptionLabel={(option) => optionLabel(option)}
      label={label}
      multiple={multiple}
      options={options}
      renderOption={renderOption}
      groupBy={
        isGrouped
          ? (option) => option.valueCoding?.displayGroup || ''
          : undefined
      }
      isOptionEqualToValue={(option, value) =>
        optionId(option) === optionId(value) ||
        optionId(option) === optionLabel(value)
      }
      selectOnFocus={!!openchoice}
      clearOnBlur={!!openchoice}
      handleHomeEndKeys={!!openchoice}
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
                  valueString: inputValue,
                });
              }

              return filtered;
            }
          : undefined
      }
      {...props}
      textInputProps={{ ...props.textInputProps, error }}
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
