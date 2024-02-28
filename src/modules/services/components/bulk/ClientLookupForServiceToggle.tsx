import SearchIcon from '@mui/icons-material/Search';

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CommonToggle from '@/components/elements/CommonToggle';
import { ServiceListIcon } from '@/components/elements/SemanticIcons';
import useSafeParams from '@/hooks/useSafeParams';
import { ProjectDashboardRoutes } from '@/routes/routes';
import { generateSafePath } from '@/utils/pathEncoding';

export type ClientLookupMode = 'search' | 'scan' | 'service_date';

export function isClientLookupMode(value: string): value is ClientLookupMode {
  return !!value && ['search', 'scan', 'service_date'].includes(value);
}
interface ClientLookupForServiceToggleProps {
  value: ClientLookupMode;
  onNavigate: VoidFunction;
}

const modeToRoute = {
  search: ProjectDashboardRoutes.BULK_ASSIGN_SERVICE_SEARCH,
  service_date: ProjectDashboardRoutes.BULK_ASSIGN_SERVICE_LIST,
  scan: ProjectDashboardRoutes.BULK_ASSIGN_SERVICE_SEARCH, // TODO  implement
};

/**
 * Toggle between Bulk Service lookup modes. Navigates on change.
 */
const ClientLookupForServiceToggle: React.FC<
  ClientLookupForServiceToggleProps
> = ({ value, onNavigate }) => {
  const params = useSafeParams();
  const navigate = useNavigate();
  const onChange = useCallback(
    (newVal: ClientLookupMode) => {
      onNavigate();
      navigate(generateSafePath(modeToRoute[newVal], params));
    },
    [navigate, params, onNavigate]
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
          value: 'service_date',
          label: 'Show By Last Service Date',
          Icon: ServiceListIcon,
        },
      ]}
    />
  );
};

export default ClientLookupForServiceToggle;
