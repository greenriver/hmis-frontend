import React, { useCallback, useMemo } from 'react';

import GenericSelect, {
  GenericSelectProps,
} from '@/components/elements/input/GenericSelect';
import { renderOption } from '@/components/elements/input/ProjectSelect';
import { getOptionLabelFromOptions } from '@/modules/form/components/FormSelect';
import { PickListOption } from '@/types/gqlTypes';

export type FormSelectStringProps = Omit<
  GenericSelectProps<PickListOption, false, false>,
  'value' | 'onChange'
> & {
  value?: string | null;
  onChange: (value: string | null) => void;
};

// simple wrapper around FormSelect that uses string as value, but PickListOption as option list
// this should be renamed to something better. it's also duplicative with the filter select component
const FormSelectString: React.FC<FormSelectStringProps> = ({
  options,
  value,
  onChange,
  loading,
  placeholder,
  ...props
}) => {
  const isGrouped = !!options[0]?.groupLabel;

  const valueOption = useMemo(
    () => options.find(({ code }) => code === value) || null,
    [value, options]
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
      getOptionLabel={getOptionLabel}
      options={options}
      renderOption={renderOption}
      groupBy={isGrouped ? (opt) => opt.groupLabel || '' : undefined}
      isOptionEqualToValue={isOptionEqualToValue}
      value={valueOption}
      onChange={(_event, value) => onChange(value?.code || null)}
      {...props}
      multiple={false}
    />
  );
};

export default FormSelectString;
