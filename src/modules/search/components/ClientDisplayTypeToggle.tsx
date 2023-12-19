import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline';
import CommonToggle, {
  CommonToggleProps,
} from '@/components/elements/CommonToggle';

export type DisplayType = 'table' | 'cards';

interface ClientDisplayTypeToggleProps {
  value: DisplayType;
  onChange: CommonToggleProps<DisplayType>['onChange'];
}

const ClientDisplayTypeToggle: React.FC<ClientDisplayTypeToggleProps> = ({
  value,
  onChange,
}) => (
  <CommonToggle
    value={value}
    onChange={onChange}
    items={[
      {
        value: 'table',
        label: 'Table',
        testId: 'tableToggleButton',
        Icon: ViewHeadlineIcon,
      },
      {
        value: 'cards',
        label: 'Cards',
        testId: 'cardToggleButton',
        Icon: ViewCompactIcon,
      },
    ]}
    variant='gray'
    size='small'
    aria-label='results display format'
  />
);

export default ClientDisplayTypeToggle;
