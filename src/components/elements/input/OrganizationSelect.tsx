import { useCallback } from 'react';
import GenericSelect, { GenericSelectProps } from './GenericSelect';
import { renderOption } from './ProjectSelect';

import { findOptionLabel } from '@/modules/form/util/formUtil';
import {
  PickListOption,
  PickListType,
  useGetPickListQuery,
} from '@/types/gqlTypes';

type Option = PickListOption;

// FIXME dedup use FormSelect

const OrganizationSelect = <Multiple extends boolean | undefined>({
  multiple,
  label = multiple ? 'Organizations' : 'Organization',
  value,
  ...props
}: Omit<GenericSelectProps<Option, Multiple, undefined>, 'options'>) => {
  const {
    data: { pickList } = {},
    loading,
    error,
  } = useGetPickListQuery({
    variables: { pickListType: PickListType.Organization },
  });

  if (error) console.error(error);

  const getOptionLabel = useCallback(
    (option: Option) => findOptionLabel(option, pickList as PickListOption[]),
    [pickList]
  );

  return (
    <GenericSelect
      getOptionLabel={getOptionLabel}
      groupBy={(option) => option.groupLabel || ''}
      label={label}
      loading={loading}
      multiple={multiple}
      options={pickList || []}
      renderOption={renderOption}
      isOptionEqualToValue={(option, value) => option.code === value.code}
      value={value}
      {...props}
    />
  );
};

export default OrganizationSelect;
