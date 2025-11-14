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

export type ControlledSelectProps = Omit<
  GenericSelectProps<PickListOption, false, false>,
  'value' | 'onChange' | 'onBlur' | 'multiple'
> & {
  name: string;
  control?: Control; // Optional when using FormProvider
  rules?: RhfRules;
  required?: boolean;
  helperText?: ReactNode;
  placeholder?: string;
  onChange?: (option: PickListOption | null) => void;
  setValueAs?: (option: PickListOption | null) => any; // allow transform PickListOption to desired value (to support boolean)
};

// React-Hook-Form wrapper around GenericSelect for single selection.
// This component stores a string as the field value, but passes a PickListOption to the GenericSelect. (Logic that is redundant with TableFilterItemSelect, among others)
const ControlledSelect: React.FC<ControlledSelectProps> = ({
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
