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

export type ControlledSelectProps<Multiple extends boolean = false> = Omit<
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
  onChange?: (
    option: Multiple extends true ? PickListOption[] : PickListOption | null
  ) => void;
  setValueAs?: (
    option: Multiple extends true ? PickListOption[] : PickListOption | null
  ) => any; // allow transform PickListOption to desired value (to support boolean)
};

// React-Hook-Form wrapper around GenericSelect.
// This component stores a string as the field value, but passes a PickListOption to the GenericSelect. (Logic that is redundant with TableFilterItemSelect, among others)
const ControlledSelect = <Multiple extends boolean = false>({
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

  // The 'value' stored in the form state is a string (or array of strings for multiple),
  // but the value passed to GenericSelect is a PickListOption (or PickListOption[]).
  // This component handles the conversion between the two.
  // If a value is not found in the options list, display it anyway as a fallback option.

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

  const valueOption = useMemo(() => {
    if (multiple) {
      if (!field.value) return [];

      const values = Array.isArray(field.value) ? field.value : [field.value];
      // For each selected value, return the PickListOption with the same code.
      // If not found, create a fallback option with that code so it can be displayed anyway
      return values.map(
        (val: any) => optionsByCode[val.toString()] || { code: val.toString() }
      );
    }

    if (isNil(field.value) || field.value === '') return null;

    // Find the option with the same code as the field value. Use toString() to handle boolean values
    return (
      options.find(({ code }) => code === field.value.toString()) || {
        code: field.value,
      }
    );
  }, [multiple, field.value, optionsByCode, options]);

  const handleMultipleChange = useCallback(
    (value: PickListOption | PickListOption[] | null) => {
      // If it's a multi picklist, ensure value is a PickListOption[] array
      const arr = Array.isArray(value) ? value : [];
      // Type assertion: We know setValueAs expects PickListOption[] when multiple is true,
      // but TypeScript can't narrow the conditional type based on the runtime value of `multiple`
      const val = setValueAs
        ? (setValueAs as (option: PickListOption[]) => any)(arr)
        : arr.map((o) => o.code);
      field.onChange(val);
      // Type assertion: We know onChange expects PickListOption[] when multiple is true
      if (onChange) (onChange as (option: PickListOption[]) => void)(arr);
    },
    [field, onChange, setValueAs]
  );

  const handleSingleChange = useCallback(
    (value: PickListOption | PickListOption[] | null) => {
      // If it's a single (non multi) picklist, ensure value is a single PickListOption or null
      const single = Array.isArray(value) ? null : value;
      // Type assertion: We know setValueAs expects PickListOption | null when multiple is false,
      // but TypeScript can't narrow the conditional type based on the runtime value of `multiple`
      const val = setValueAs
        ? (setValueAs as (option: PickListOption | null) => any)(single)
        : single?.code || null;
      field.onChange(val);
      // Type assertion: We know onChange expects PickListOption | null when multiple is false
      if (onChange)
        (onChange as (option: PickListOption | null) => void)(single);
    },
    [field, onChange, setValueAs]
  );

  if (multiple) {
    return (
      <GenericSelect<PickListOption, true, false>
        {...(props as any)}
        value={valueOption as PickListOption[]}
        onChange={(_event, value) => handleMultipleChange(value)}
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
        // fields for using PickListOption as the option type
        options={options}
        getOptionLabel={(option) => findOptionLabel(option, options)}
        renderOption={renderOption}
        groupBy={isGrouped ? (opt) => opt.groupLabel || '' : undefined}
        isOptionEqualToValue={(option, value) => option.code === value.code}
      />
    );
  }

  return (
    <GenericSelect<PickListOption, false, false>
      {...(props as any)}
      value={valueOption as PickListOption | null}
      onChange={(_event, value) => handleSingleChange(value)}
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
      multiple={false}
      // fields for using PickListOption as the option type
      options={options}
      getOptionLabel={(option) => findOptionLabel(option, options)}
      renderOption={renderOption}
      groupBy={isGrouped ? (opt) => opt.groupLabel || '' : undefined}
      isOptionEqualToValue={(option, value) => option.code === value.code}
    />
  );
};

export default ControlledSelect;
