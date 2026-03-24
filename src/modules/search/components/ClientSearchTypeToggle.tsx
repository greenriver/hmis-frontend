import LocationSearchingIcon from '@mui/icons-material/LocationSearching';
import SearchIcon from '@mui/icons-material/Search';

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CommonToggle from '@/components/elements/CommonToggle';
import LabelWithContent from '@/components/elements/LabelWithContent';
import { Routes } from '@/routes/routes';

export type SearchType = 'broad' | 'specific';

interface ClientSearchTypeToggleProps {
  value: SearchType;
}

/**
 * Toggle between broad (text) and specific (advanced) client search modes.
 * Uses React Router navigation to switch between "broad" and "specific" client search routes.
 */
const ClientSearchTypeToggle: React.FC<ClientSearchTypeToggleProps> = ({
  value,
}) => {
  const navigate = useNavigate();
  const handleChange = useCallback(
    (newValue: SearchType) => {
      switch (newValue) {
        case 'broad':
          navigate(Routes.CLIENT_SEARCH);
          break;
        case 'specific':
          navigate(Routes.CLIENT_SEARCH_ADVANCED);
          break;
      }
    },
    [navigate]
  );

  return (
    <LabelWithContent
      label='Search Type'
      LabelProps={{ sx: { fontSize: 16 } }}
      labelId='search-type-label'
      renderChildren={(labelElement) => (
        <CommonToggle
          value={value}
          onChange={handleChange}
          aria-labelledby={
            (labelElement && labelElement.getAttribute('id')) || undefined
          }
          items={[
            {
              value: 'broad',
              label: 'Broad Search',
              testId: 'broadSearchToggleButton',
              Icon: SearchIcon,
            },
            {
              value: 'specific',
              label: 'Specific Search',
              testId: 'specificSearchToggleButton',
              Icon: LocationSearchingIcon,
            },
          ]}
        />
      )}
    />
  );
};

export default ClientSearchTypeToggle;
