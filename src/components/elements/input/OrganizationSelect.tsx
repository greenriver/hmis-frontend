import { Typography, Autocomplete } from '@mui/material';

import TextInput from './TextInput';

export interface OrganizationOption {
  readonly label: string;
  readonly value: string;
}

const fakeOptions: readonly OrganizationOption[] = [
  {
    value: '1',
    label: 'Sassafrass Center',
  },
  {
    value: '2',
    label: 'Red Pine Center',
  },
  {
    value: '3',
    label: 'Red Cedar House',
  },
];

const renderOption = (props: object, option: OrganizationOption) => (
  <li {...props}>
    <Typography variant='body2'>{option.label}</Typography>
  </li>
);
interface Props {
  value: OrganizationOption[] | OrganizationOption | null;
  onChange: (option: OrganizationOption[] | OrganizationOption | null) => void;
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
      isOptionEqualToValue={(
        option: OrganizationOption,
        value: OrganizationOption
      ) => option.value === value.value}
    />
  );
};

export default OrganizationSelect;
