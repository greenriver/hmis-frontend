import SearchIcon from '@mui/icons-material/Search';

// eslint-disable-next-line no-restricted-imports
import CommonToggle from '@/components/elements/CommonToggle';
import { ServiceListIcon } from '@/components/elements/SemanticIcons';

export type ClientLookupMode = 'search' | 'scan' | 'list';

export function isClientLookupMode(value: string): value is ClientLookupMode {
  return !!value && ['search', 'scan', 'list'].includes(value);
}
interface ClientLookupForServiceToggleProps {
  value: ClientLookupMode;
  onChange: (mode: ClientLookupMode) => void;
  serviceTypeName: string;
}

/**
 * Toggle between Bulk Service lookup modes. Navigates on change.
 */
const ClientLookupForServiceToggle: React.FC<
  ClientLookupForServiceToggleProps
> = ({ value, onChange, serviceTypeName }) => {
  return (
    <CommonToggle
      value={value}
      onChange={onChange}
      aria-label='client lookup mode'
      size='small'
      items={[
        {
          value: 'search',
          label: 'Search Clients',
          Icon: SearchIcon,
        },
        // {
        //   value: 'scan',
        //   label: 'Scan Card',
        //   Icon: ScanCardIcon,
        // },
        {
          value: 'list',
          label: `Show By Last ${serviceTypeName} Date`,
          Icon: ServiceListIcon,
        },
      ]}
    />
  );
};

export default ClientLookupForServiceToggle;
