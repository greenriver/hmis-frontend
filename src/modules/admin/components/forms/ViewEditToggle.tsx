import CommonToggle, { ToggleItem } from '@/components/elements/CommonToggle';
import { EditIcon, ViewIcon } from '@/components/elements/SemanticIcons';

export type ViewMode = 'view' | 'edit';
const items: ToggleItem<ViewMode>[] = [
  {
    value: 'edit',
    label: 'Editing',
    Icon: EditIcon,
  },
  {
    value: 'view',
    label: 'Viewing',
    Icon: ViewIcon,
  },
];

interface Props {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
}
const ViewEditToggle: React.FC<Props> = ({ value, onChange }) => {
  return (
    <CommonToggle<ViewMode>
      value={value}
      onChange={onChange}
      items={items}
      variant='gray'
      size='small'
    />
  );
};

export default ViewEditToggle;
