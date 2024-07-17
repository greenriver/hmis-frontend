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
  'value' | 'onChange' | 'onBlur'
> & {
  name: string;
  control?: Control; // Optional when using FormProvider
  rules?: RhfRules;
  required?: boolean;
  helperText?: ReactNode;
};

// React-Hook-Form wrapper around GenericSelect.
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

  // The 'value' thats stored in the form state is a string, but the value that gets
  // passed to GenericSelect is a PickListOption
  const valueOption = useMemo(
    () => options.find(({ code }) => code === field.value) || null,
    [field.value, options]
  );

  const getOptionLabel = useCallback(
    (option: PickListOption) => findOptionLabel(option, options),
    [options]
  );

  return (
    <GenericSelect<PickListOption, false, false>
      {...props}
      value={valueOption}
      onChange={(_event, value) => field.onChange(value?.code || null)}
      textInputProps={{
        name: field.name,
        helperText: error?.message || helperText,
        error: !!error,
        inputRef: field.ref, // send input ref, so we can focus on input when error appear
        required,
        placeholder,
        ...props.textInputProps, // allow overriding any of the above
      }}
      onBlur={field.onBlur}
      multiple={false}
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
