import SearchIcon from '@mui/icons-material/Search';

import { useCallback } from 'react';
// eslint-disable-next-line no-restricted-imports
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import CommonToggle from '@/components/elements/CommonToggle';
import { ServiceListIcon } from '@/components/elements/SemanticIcons';
import useCurrentPath from '@/hooks/useCurrentPath';

export type ClientLookupMode = 'search' | 'scan' | 'list';

export function isClientLookupMode(value: string): value is ClientLookupMode {
  return !!value && ['search', 'scan', 'list'].includes(value);
}
interface ClientLookupForServiceToggleProps {
  value: ClientLookupMode;
  onNavigate: VoidFunction;
  serviceTypeName: string;
}

/**
 * Toggle between Bulk Service lookup modes. Navigates on change.
 */
const ClientLookupForServiceToggle: React.FC<
  ClientLookupForServiceToggleProps
> = ({ value, onNavigate, serviceTypeName }) => {
  const navigate = useNavigate();
  const params = useParams();
  const location = useCurrentPath();

  const onChange = useCallback(
    (newVal: ClientLookupMode) => {
      onNavigate();
      navigate(
        generatePath(location || 'err', { ...params, lookupMode: newVal })
      );
    },
    [location, navigate, onNavigate, params]
  );

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
