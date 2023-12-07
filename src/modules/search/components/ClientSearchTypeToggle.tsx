import LocationSearchingIcon from '@mui/icons-material/LocationSearching';
import SearchIcon from '@mui/icons-material/Search';

import CommonToggle, {
  CommonToggleProps,
} from '@/components/elements/CommonToggle';
import LabelWithContent from '@/components/elements/LabelWithContent';

export type SearchType = 'broad' | 'specific';

interface ClientSearchTypeToggleProps {
  value: SearchType;
  onChange: CommonToggleProps<SearchType>['onChange'];
}

const ClientSearchTypeToggle: React.FC<ClientSearchTypeToggleProps> = ({
  value,
  onChange,
}) => (
  <LabelWithContent
    label='Search Type'
    LabelProps={{ sx: { fontSize: 16 } }}
    labelId='search-type-label'
    renderChildren={(labelElement) => (
      <CommonToggle
        value={value}
        onChange={onChange}
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

export default ClientSearchTypeToggle;
