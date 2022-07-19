import { Typography, Autocomplete } from '@mui/material';

import TextInput from './TextInput';

export interface OrganizationOption {
  readonly organizationName: string;
  readonly id: string;
}

const fakeOptions: readonly OrganizationOption[] = [
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
interface Props {
  value: OrganizationSelectValue;
  onChange: (option: OrganizationSelectValue) => void;
  isMulti?: boolean;
}

const OrganizationSelect: React.FC<Props> = ({
  value,
  onChange,
  isMulti: multiple,
}) => {
  // FIXME replace with GQL query that returns grouped organization list
  const options = fakeOptions;
  const loading = false;

  return (
    <Autocomplete
      loading={loading}
      options={options || []}
      value={value}
      onChange={(_, selected) => onChange(selected)}
      multiple={multiple}
      renderOption={renderOption}
      renderInput={(params) => <TextInput {...params} label='Organizations' />}
      getOptionLabel={(option) => option.organizationName}
      isOptionEqualToValue={(
        option: OrganizationOption,
        value: OrganizationOption
      ) => option.id === value.id}
    />
  );
};

export default OrganizationSelect;
