import { useFieldArray } from 'react-hook-form';
import { v4 } from 'uuid';
import { FormItemControl } from '../types';
import CardGroup, { RemovableCard } from './CardGroup';
import ValueBoundCard from './ValueBoundCard';
import { ItemMap } from '@/modules/form/types';
import { BoundType, ValidationSeverity } from '@/types/gqlTypes';
interface Props {
  control: FormItemControl;
  itemMap: ItemMap;
}

const ValueBounds: React.FC<Props> = ({ control, itemMap }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'bounds',
  });

  return (
    <CardGroup
      onAddItem={() => {
        append(
          {
            id: `bound_${v4().split('-')[0]}`,
            type: BoundType.Max,
            severity: ValidationSeverity.Error,
          },
          { shouldFocus: false }
        );
      }}
      addItemText='Add Bound'
    >
      {fields.map((bound, index) => (
        <RemovableCard
          key={JSON.stringify(bound)} // fixme could be non unique
          onRemove={() => remove(index)}
          removeTooltip={'Remove Bound'}
        >
          <ValueBoundCard index={index} control={control} itemMap={itemMap} />
        </RemovableCard>
      ))}
    </CardGroup>
  );
};
export default ValueBounds;
