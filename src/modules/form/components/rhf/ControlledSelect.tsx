import { isNil } from 'lodash-es';
import React, { ReactNode, useCallback, useMemo } from 'react';

import {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
  useController,
} from 'react-hook-form';
import GenericSelect, {
  GenericSelectProps,
} from '@/components/elements/input/GenericSelect';
import { renderOption } from '@/components/elements/input/ProjectSelect';
import { RhfRules } from '@/modules/form/types';
import { findOptionLabel } from '@/modules/form/util/formUtil';
import { PickListOption } from '@/types/gqlTypes';

type ControlledSelectValue = PickListOption['code'] | boolean | null;

export type ControlledSelectProps<T extends FieldValues = FieldValues> = Omit<
  GenericSelectProps<PickListOption, false, false>,
  'value' | 'onChange' | 'onBlur' | 'multiple'
> & {
  // Path<T> gives callers type checking for nested RHF paths.
  name: Path<T>;
  control?: Control<T>; // Optional when using FormProvider
  rules?: RhfRules;
  required?: boolean;
  helperText?: ReactNode;
  placeholder?: string;
  // Called with the value stored in RHF, not the raw PickListOption.
  onChange?: (value: ControlledSelectValue) => void;
  // Use when the form value is not the option code, such as boolean JSON values.
  setValueAs?: (option: PickListOption | null) => ControlledSelectValue;
  // Defaults to true to preserve existing behavior; conditional builders can opt
  // out when they need explicit reset logic to decide which values are stale.
  shouldUnregister?: boolean;
};

// React-Hook-Form wrapper around GenericSelect for single selection.
// This component stores a string as the field value, but passes a PickListOption to the GenericSelect. (Logic that is redundant with TableFilterItemSelect, among others)
const ControlledSelect = <T extends FieldValues = FieldValues>({
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
  shouldUnregister = true,
  ...props
}: ControlledSelectProps<T>) => {
  const {
    field,
    fieldState: { error },
  } = useController<T>({
    name,
    control,
    shouldUnregister,
    rules: {
      required: required ? 'This field is required' : false,
      ...rules,
    } as RegisterOptions<T, Path<T>>,
  });

  const isGrouped = !!options[0]?.groupLabel;

  // The 'value' stored in the form state is a string, but the value passed to
  // GenericSelect is a PickListOption. This component handles the conversion between the two.
  // If a value is not found in the options list, display it anyway as a fallback option.
  const valueOption = useMemo(() => {
    if (isNil(field.value) || field.value === '') return null;

    // Find the option with the same code as the field value. Use toString() to handle boolean values
    return (
      options.find(({ code }) => code === field.value.toString()) || {
        code: field.value,
      }
    );
  }, [field.value, options]);

  const getOptionLabel = useCallback(
    (option: PickListOption) => findOptionLabel(option, options),
    [options]
  );

  return (
    <GenericSelect<PickListOption, false, false>
      {...props}
      value={valueOption}
      onChange={(_event, option) => {
        const val = setValueAs ? setValueAs(option) : option?.code || null;
        field.onChange(val);
        if (onChange) onChange(val);
      }}
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
      getOptionLabel={getOptionLabel}
      renderOption={renderOption}
      groupBy={isGrouped ? (opt) => opt.groupLabel || '' : undefined}
      isOptionEqualToValue={(option, value) => option.code === value.code}
    />
  );
};

export default ControlledSelect;
