import SearchIcon from '@mui/icons-material/Search';

// eslint-disable-next-line no-restricted-imports
import CommonToggle from '@/components/elements/CommonToggle';
import { ServiceListIcon } from '@/components/elements/SemanticIcons';

export type ClientLookupMode = 'search' | 'scan' | 'list';

interface BulkServiceSearchToggleProps {
  value: ClientLookupMode;
  onChange: (mode: ClientLookupMode) => void;
  serviceTypeName: string;
}

/**
 * Toggle between Bulk Service lookup modes
 */
const BulkServiceSearchToggle: React.FC<BulkServiceSearchToggleProps> = ({
  value,
  onChange,
  serviceTypeName,
}) => {
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

export default BulkServiceSearchToggle;
