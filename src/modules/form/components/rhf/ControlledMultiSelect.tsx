import React, { ReactNode, useCallback, useMemo } from 'react';

import { Control, useController } from 'react-hook-form';
import GenericSelect, {
  GenericSelectProps,
} from '@/components/elements/input/GenericSelect';
import { renderOption } from '@/components/elements/input/ProjectSelect';
import { RhfRules } from '@/modules/form/types';
import { findOptionLabel } from '@/modules/form/util/formUtil';
import { PickListOption } from '@/types/gqlTypes';

export type ControlledMultiSelectProps = Omit<
  GenericSelectProps<PickListOption, true, false>,
  'value' | 'onChange' | 'onBlur' | 'multiple'
> & {
  name: string;
  control?: Control; // Optional when using FormProvider
  rules?: RhfRules;
  required?: boolean;
  helperText?: ReactNode;
  placeholder?: string;
  onChange?: (options: PickListOption[]) => void;
  setValueAs?: (options: PickListOption[]) => any;
};

// React-Hook-Form wrapper around GenericSelect for multiple selection.
// This component stores an array of strings as the field value, but passes a PickListOption[] to the GenericSelect.
const ControlledMultiSelect: React.FC<ControlledMultiSelectProps> = ({
  name,
  control,
  rules,
  required,
  options,
  loading,
  placeholder,
  helperText,
  onChange,
  setValueAs,
  ...props
}) => {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    shouldUnregister: true,
    rules: {
      required: required ? 'This field is required' : false,
      ...rules,
    },
  });

  const isGrouped = !!options[0]?.groupLabel;

  // Organize the available pick list options into a map by code for lookup
  const optionsByCode = useMemo(
    () =>
      options.reduce(
        (acc: Record<string, PickListOption>, option: PickListOption) => {
          acc[option.code] = option;
          return acc;
        },
        {}
      ),
    [options]
  );

  // The 'value' stored in the form state is an array of strings, but the value passed to
  // GenericSelect is a PickListOption[]. This component handles the conversion between the two.
  // If a value is not found in the options list, display it anyway as a fallback option.
  const valueOption = useMemo(() => {
    if (!field.value) return [];

    const values = Array.isArray(field.value) ? field.value : [field.value];
    // For each selected value, return the PickListOption with the same code.
    // If not found, create a fallback option with that code so it can be displayed anyway
    return values.map(
      (val: any) => optionsByCode[val.toString()] || { code: val.toString() }
    );
  }, [field.value, optionsByCode]);

  const handleChange = useCallback(
    (value: PickListOption | PickListOption[] | null) => {
      const arr = Array.isArray(value) ? value : [];
      const val = setValueAs ? setValueAs(arr) : arr.map((o) => o.code);
      field.onChange(val);
      if (onChange) onChange(arr);
    },
    [field, onChange, setValueAs]
  );

  return (
    <GenericSelect<PickListOption, true, false>
      {...props}
      value={valueOption}
      onChange={(_event, value) => handleChange(value)}
      textInputProps={{
        name: field.name,
        helperText: error?.message || helperText,
        error: !!error,
        inputRef: field.ref, // send input ref, so we can focus on input when error appear
        placeholder,
        ...props.textInputProps, // allow overriding any of the above
      }}
      onBlur={field.onBlur}
      multiple={true}
      options={options}
      getOptionLabel={(option) => findOptionLabel(option, options)}
      renderOption={renderOption}
      groupBy={isGrouped ? (opt) => opt.groupLabel || '' : undefined}
      isOptionEqualToValue={(option, value) => option.code === value.code}
    />
  );
};

export default ControlledMultiSelect;
