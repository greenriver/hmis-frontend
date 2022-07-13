import { Typography, Box } from '@mui/material';
import Select, { OnChangeValue } from 'react-select';

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

const formatOptionLabel = ({ label }: OrganizationOption) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
    <Typography variant='body2' sx={{ ml: 1 }}>
      {label}
    </Typography>
  </Box>
);

interface Props {
  value: OrganizationOption[] | OrganizationOption | null | undefined;
  onChange: (option: OnChangeValue<OrganizationOption, boolean>) => void;
  isMulti?: boolean;
}

const OrganizationSelect: React.FC<Props> = ({ value, onChange, isMulti }) => {
  // FIXME replace with GQL query that returns grouped organization list
  const options = fakeOptions;
  const loading = false;

  return (
    <Select
      isLoading={loading}
      placeholder={isMulti ? 'Organizations' : 'Organization'}
      formatOptionLabel={formatOptionLabel}
      value={value}
      onChange={onChange}
      options={options}
      isMulti={isMulti || undefined}
    />
  );
};

export default OrganizationSelect;
