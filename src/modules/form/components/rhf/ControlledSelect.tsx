import { isNil } from 'lodash-es';
import React, { ReactNode, useCallback, useMemo } from 'react';

import { Control, useController } from 'react-hook-form';
import GenericSelect, {
  GenericSelectProps,
} from '@/components/elements/input/GenericSelect';
import { renderOption } from '@/components/elements/input/ProjectSelect';
import { RhfRules } from '@/modules/form/types';
import { findOptionLabel } from '@/modules/form/util/formUtil';
import { PickListOption } from '@/types/gqlTypes';

export type ControlledSelectValue<Multiple> = Multiple extends true
  ? Array<PickListOption>
  : PickListOption | null;

export type ControlledSelectProps<Multiple extends boolean> = Omit<
  GenericSelectProps<PickListOption, Multiple, false>,
  'value' | 'onChange' | 'onBlur'
> & {
  name: string;
  control?: Control; // Optional when using FormProvider
  rules?: RhfRules;
  required?: boolean;
  helperText?: ReactNode;
  placeholder?: string;
  multiple?: Multiple;
  onChange?: (option: ControlledSelectValue<Multiple>) => void;
  setValueAs?: (option: ControlledSelectValue<Multiple>) => any; // allow transform PickListOption to desired value (to support boolean)
};

// React-Hook-Form wrapper around GenericSelect.
// This component stores a string as the field value, but passes a PickListOption to the GenericSelect. (Logic that is redundant with TableFilterItemSelect, among others)
const ControlledSelect = <Multiple extends boolean>({
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
  multiple,
  ...props
}: ControlledSelectProps<Multiple>) => {
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

  // The 'value' stored in the form state is a string or array of strings, but the value that gets
  // passed to GenericSelect is a PickListOption or PickListOption[]. If the value is not found,
  // display it anyway as the selected option. This could occur if there is a value set that is not in the options list.
  const valueOption = useMemo(() => {
    // Organize the available pick list options into a map by code for lookup
    const optionsByCode = options.reduce(
      (acc, option) => {
        acc[option.code] = option;
        return acc;
      },
      {} as Record<string, PickListOption>
    );

    if (multiple) {
      if (isNil(field.value) || field.value === '') return [];
      const selectedOptions = Array.isArray(field.value)
        ? field.value
        : [field.value];
      // For each selected option, return the PickListOption with the same code.
      // If not found, create an option with that code so it can be displayed anyway
      return selectedOptions.map(
        (val: any) => optionsByCode[val.toString()] || { code: val.toString() }
      );
    }

    if (isNil(field.value) || field.value === '') return null;

    return (
      // Find the option with the same code as the field value. Use toString() to handle boolean values
      options.find(({ code }) => code === field.value.toString()) || {
        code: field.value,
      }
    );
  }, [field.value, options, multiple]);

  const getOptionLabel = useCallback(
    (option: PickListOption) => findOptionLabel(option, options),
    [options]
  );

  const handleChange = useCallback(
    (value: PickListOption | PickListOption[] | null) => {
      if (multiple) {
        // If it's a multi picklist, cast the value to a PickListOption[] array
        const arr = (value || []) as PickListOption[];
        const val = setValueAs
          ? setValueAs(arr as any)
          : arr.map((o) => o.code || null).filter((c) => c !== null);
        field.onChange(val);
        if (onChange) onChange(arr as any);
      } else {
        // If it's a single (non multi) picklist, cast the value to a single PickListOption
        const single = value as PickListOption | null;
        const val = setValueAs
          ? setValueAs(single as any)
          : single?.code || null;
        field.onChange(val);
        if (onChange) onChange(single as any);
      }
    },
    [field, multiple, onChange, setValueAs]
  );

  return (
    <GenericSelect
      {...props}
      value={valueOption as any}
      onChange={(_event, value) => handleChange(value)}
      textInputProps={{
        name: field.name,
        helperText: error?.message || helperText,
        error: !!error,
        inputRef: field.ref, // send input ref, so we can focus on input when error appear
        // required, // Instead of passing `required` to the input, rely on RHF's required rule, which uses nicer formatting
        placeholder,
        ...props.textInputProps, // allow overriding any of the above
      }}
      onBlur={field.onBlur}
      multiple={multiple}
      // fields for using PickListOoption as the option type
      options={options}
      getOptionLabel={getOptionLabel}
      renderOption={renderOption}
      groupBy={isGrouped ? (opt) => opt.groupLabel || '' : undefined}
      isOptionEqualToValue={(option, value) => option.code === value.code}
    />
  );
};

export default ControlledSelect;
