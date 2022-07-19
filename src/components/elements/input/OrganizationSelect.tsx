import { Typography } from '@mui/material';

import GenericSelect, { GenericSelectProps, Option } from './GenericSelect';

export interface OrganizationOption extends Option {
  organizationName: string;
}

const fakeOptions: OrganizationOption[] = [
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

const renderOption = (props: object, option: OrganizationOption) => (
  <li {...props} key={option.id}>
    <Typography variant='body2'>{option.organizationName}</Typography>
  </li>
);

export type OrganizationSelectValue =
  | OrganizationOption[]
  | OrganizationOption
  | null;

const OrganizationSelect: React.FC<
  Omit<GenericSelectProps<OrganizationOption>, 'options'>
> = ({
  multiple,
  label = multiple ? 'Organizations' : 'Organization',
  ...props
}) => {
  // FIXME replace with GQL query that returns grouped organization list
  const options = fakeOptions;
  const loading = false;

  return (
    <GenericSelect<OrganizationOption>
      getOptionLabel={(option) => option.organizationName}
      label={label}
      loading={loading}
      multiple={multiple}
      options={options}
      renderOption={renderOption}
      {...props}
    />
  );
};

export default OrganizationSelect;
