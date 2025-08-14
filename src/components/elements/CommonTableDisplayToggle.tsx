import CommonToggle, {
  CommonToggleProps,
} from '@/components/elements/CommonToggle';
import {
  TableCardsIcon,
  TableRowsIcon,
} from '@/components/elements/SemanticIcons';

export type DisplayType = 'table' | 'cards';

interface CommonTableDisplayToggleProps {
  value: DisplayType;
  onChange: CommonToggleProps<DisplayType>['onChange'];
}

/**
 * Toggle component for switching between table and card display types for tables.
 *
 * @param value - Current display type.
 * @param onChange - Function to call when the display type changes.
 */
const CommonTableDisplayToggle: React.FC<CommonTableDisplayToggleProps> = ({
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
        Icon: TableRowsIcon,
      },
      {
        value: 'cards',
        label: 'Cards',
        testId: 'cardToggleButton',
        Icon: TableCardsIcon,
      },
    ]}
    variant='gray'
    size='small'
    aria-label='results display format'
  />
);

export default CommonTableDisplayToggle;
