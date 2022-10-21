import { AutocompleteValue } from '@mui/material';
import { compact } from 'lodash-es';

import GenericSelect, { GenericSelectProps } from './GenericSelect';
import { renderOption } from './ProjectSelect';

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

  // special case to replace value with complete option value.
  // e.g. {id: 50} becomes {id: 50, projectName: "White Ash Home"}
  // this is needed for cases when initially selected values are loaded from URL params
  if (Array.isArray(value) && value[0] && !value[0].label && pickList) {
    value = compact(
      value.map(({ code }) => pickList.find((opt) => opt.code === code))
    ) as AutocompleteValue<Option, Multiple, boolean, undefined>;
  }

  return (
    <GenericSelect
      getOptionLabel={(option) => option.label || option.code}
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
