import { useQuery } from '@apollo/client';
import { Typography } from '@mui/material';

import GenericSelect, { GenericSelectProps } from './GenericSelect';

import { GET_ORGANIZATIONS } from '@/api/organizations.gql';
import { Organization } from '@/types/gqlTypes';

export type Option = Omit<Organization, 'projects'>;

const renderOption = (props: object, option: Option) => (
  <li {...props} key={option.id}>
    <Typography variant='body2'>{option.organizationName}</Typography>
  </li>
);

export type OrganizationSelectValue = Option[] | Option | null;

const OrganizationSelect: React.FC<
  Omit<GenericSelectProps<Option>, 'options'>
> = ({
  multiple,
  label = multiple ? 'Organizations' : 'Organization',
  ...props
}) => {
  const { data, loading, error } = useQuery<{
    organizations: Option[];
  }>(GET_ORGANIZATIONS);
  if (error) console.error(error);

  return (
    <GenericSelect<Option>
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
