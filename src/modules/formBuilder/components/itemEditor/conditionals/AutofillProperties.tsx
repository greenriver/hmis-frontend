import { useFieldArray, UseFormSetValue } from 'react-hook-form';
import { FormItemControl, FormItemState } from '../types';
import AutofillValueCard from './AutofillValueCard';
import CardGroup, { RemovableCard } from './CardGroup';
import { ItemMap } from '@/modules/form/types';
import { ItemType } from '@/types/gqlTypes';

interface AutofillPropertiesProps {
  control: FormItemControl;
  itemMap: ItemMap;
  itemType: ItemType;
  setValue: UseFormSetValue<FormItemState>;
}

// Component for managing a set of AutofillValues
const AutofillProperties: React.FC<AutofillPropertiesProps> = ({
  control,
  itemType,
  itemMap,
  setValue,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'autofillValues',
  });

  return (
    <CardGroup onAddItem={() => append({})} addItemText='Add Autofill Value'>
      {fields.map((value, index) => (
        <RemovableCard
          onRemove={() => remove(index)}
          key={JSON.stringify(value)}
          removeTooltip='Remove Autofill'
        >
          <AutofillValueCard
            title={`Autofill Value ${index + 1}`}
            index={index}
            control={control}
            itemMap={itemMap}
            itemType={itemType}
            setValue={setValue}
          />
        </RemovableCard>
      ))}
    </CardGroup>
  );
};

export default AutofillProperties;
