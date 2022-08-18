import { Typography } from '@mui/material';

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
  ...props
}: Omit<GenericSelectProps<Option, Multiple, undefined>, 'options'>) => {
  const { data, loading, error } = useGetOrganizationsForSelectQuery();
  if (error) console.error(error);

  return (
    <GenericSelect
      getOptionLabel={(option) => option.organizationName}
      label={label}
      loading={loading}
      multiple={multiple}
      options={data?.organizations || []}
      renderOption={renderOption}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      {...props}
    />
  );
};

export default OrganizationSelect;
