import React, { useCallback, useMemo } from 'react';

import { Control, useController } from 'react-hook-form';
import GenericSelect, {
  GenericSelectProps,
} from '@/components/elements/input/GenericSelect';
import { renderOption } from '@/components/elements/input/ProjectSelect';
import { getOptionLabelFromOptions } from '@/modules/form/components/FormSelect';
import { RhfRules } from '@/modules/form/types';
import { PickListOption } from '@/types/gqlTypes';

export type RhfSelectProps = Omit<
  GenericSelectProps<PickListOption, false, false>,
  'value' | 'onChange'
> & {
  name: string;
  control?: Control; // Optional when using FormProvider
  rules?: RhfRules;
  required?: boolean;
  helperText?: string;
};

// RHF wrapper wrapper around GenericSelect that uses string as value, but PickListOption as option list.
const RhfSelect: React.FC<RhfSelectProps> = ({
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
    (option: PickListOption) => getOptionLabelFromOptions(option, options),
    [options]
  );

  const isOptionEqualToValue = useCallback(
    (option: PickListOption, val: PickListOption) => option.code === val.code,
    []
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
        ...props.textInputProps, // allow overriding any of the above
      }}
      multiple={false}
      // fields for using PickListOoption as the option type
      options={options}
      getOptionLabel={getOptionLabel}
      renderOption={renderOption}
      groupBy={isGrouped ? (opt) => opt.groupLabel || '' : undefined}
      isOptionEqualToValue={isOptionEqualToValue}
    />
  );
};

export default RhfSelect;
