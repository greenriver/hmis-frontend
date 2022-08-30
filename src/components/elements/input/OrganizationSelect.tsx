import { Typography, AutocompleteValue } from '@mui/material';
import { compact } from 'lodash-es';

import GenericSelect, { GenericSelectProps } from './GenericSelect';

import {
  GetOrganizationsForSelectQuery,
  useGetOrganizationsForSelectQuery,
} from '@/types/gqlTypes';

export type Option = GetOrganizationsForSelectQuery['organizations'][0];

const renderOption = (props: object, option: Option) => (
  <li {...props} key={option.id}>
    <Typography variant='body2'>{option.organizationName}</Typography>
  </li>
);

const OrganizationSelect = <Multiple extends boolean | undefined>({
  multiple,
  label = multiple ? 'Organizations' : 'Organization',
  value,
  ...props
}: Omit<GenericSelectProps<Option, Multiple, undefined>, 'options'>) => {
  const {
    data: { organizations } = {},
    loading,
    error,
  } = useGetOrganizationsForSelectQuery();
  if (error) console.error(error);

  // special case to replace value with complete option value.
  // e.g. {id: 50} becomes {id: 50, projectName: "White Ash Home"}
  // this is needed for cases when initially selected values are loaded from URL params
  if (
    Array.isArray(value) &&
    value[0] &&
    !value[0].organizationName &&
    organizations
  ) {
    value = compact(
      value.map(({ id }) => organizations.find((opt) => opt.id === id))
    ) as AutocompleteValue<Option, Multiple, boolean, undefined>;
  }
  return (
    <GenericSelect
      getOptionLabel={(option) => option.organizationName || option.id}
      label={label}
      loading={loading}
      multiple={multiple}
      options={organizations || []}
      renderOption={renderOption}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      value={value}
      {...props}
    />
  );
};

export default OrganizationSelect;
