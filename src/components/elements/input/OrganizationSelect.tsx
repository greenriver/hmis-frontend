import { Typography } from '@mui/material';

import GenericSelect, { GenericSelectProps } from './GenericSelect';

import { Organization } from '@/types/gqlTypes';

export type Option = Omit<Organization, 'projects'>;

const fakeOptions: Option[] = [
  {
    id: '1',
    organizationName: 'Sassafrass Center',
  },
  {
    id: '2',
    organizationName: 'Red Pine Center',
  },
  {
    id: '3',
    organizationName: 'Red Cedar House',
  },
];

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
  // FIXME replace with GQL query that returns grouped organization list
  const options = fakeOptions;
  const loading = false;

  return (
    <GenericSelect<Option>
      getOptionLabel={(option) => option.organizationName}
      label={label}
      loading={loading}
      multiple={multiple}
      options={options}
      renderOption={renderOption}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      {...props}
    />
  );
};

export default OrganizationSelect;
