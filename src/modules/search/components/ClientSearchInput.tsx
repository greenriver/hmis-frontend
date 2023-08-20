import SearchIcon from '@mui/icons-material/Search';
import { Button } from '@mui/material';
import { Stack } from '@mui/system';
import { useMemo, useState } from 'react';
import TextInput, {
  TextInputProps,
} from '@/components/elements/input/TextInput';
import RequiredLabel from '@/modules/form/components/RequiredLabel';
import { useHmisAppSettings } from '@/modules/hmisAppSettings/useHmisAppSettings';
interface Props extends TextInputProps {}

// NOTE: should match behavior of ClientSearch concern in the warehouse
const defaultSearchClientsPlaceholder =
  'Search by name, DOB, SSN, or Personal ID';
const defaultSearchClientsHelperText =
  'Search by name, DOB (mm/dd/yyyy), SSN (xxx-yy-zzzz), Warehouse ID, or Personal ID.';

const ClientSearchInput: React.FC<Props> = (props) => {
  const { globalFeatureFlags } = useHmisAppSettings();

  const [placeholder, helperText] = useMemo(() => {
    if (globalFeatureFlags?.mciId) {
      return [
        defaultSearchClientsPlaceholder.replace(
          'or Personal ID',
          'Personal ID, or MCI ID'
        ),
        defaultSearchClientsHelperText.replace(
          'or Personal ID',
          'Personal ID, or MCI ID'
        ),
      ];
    }
    return [defaultSearchClientsPlaceholder, defaultSearchClientsHelperText];
  }, [globalFeatureFlags]);

  return (
    <TextInput
      label={
        <RequiredLabel
          text='Search Clients'
          TypographyProps={{ fontWeight: 600 }}
        />
      }
      name='search client'
      placeholder={placeholder}
      helperText={helperText}
      {...props}
    />
  );
};

export const ClientSearchInputWithSearchButton: React.FC<
  Omit<Props, 'onChange' | 'value'> & { onClickSearch: (value: string) => void }
> = ({ onClickSearch, ...props }) => {
  const [search, setSearch] = useState<string>('');
  return (
    <Stack direction={'row'} alignItems='flex-start' gap={2}>
      <ClientSearchInput
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        {...props}
      />
      <Button
        startIcon={<SearchIcon />}
        sx={{ mt: 3, px: 4, height: 'fit-content' }}
        variant='outlined'
        onClick={() => onClickSearch(search)}
      >
        Search
      </Button>
    </Stack>
  );
};

export default ClientSearchInput;
