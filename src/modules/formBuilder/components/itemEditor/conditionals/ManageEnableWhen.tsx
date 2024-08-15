import { useMemo } from 'react';
import { useController, useFieldArray, UseFormSetValue } from 'react-hook-form';
import { FormItemControl, FormItemState } from '../types';
import CardGroup, { RemovableCard } from './CardGroup';
import EnableWhenCondition from './EnableWhenCondition';
import { useItemPickList } from './useItemPickList';
import ControlledRadioGroupInput from '@/modules/form/components/rhf/ControlledRadioGroupInput';
import { ItemMap } from '@/modules/form/types';
import { EnableBehavior } from '@/types/gqlTypes';

export interface ManageEnableWhenProps {
  control: FormItemControl;
  itemMap: ItemMap;
  enableWhenPath?: 'enableWhen' | `autofillValues.${number}.autofillWhen`; // path to enableWhen in form
  enableBehaviorPath?:
    | 'enableBehavior'
    | `autofillValues.${number}.autofillBehavior`;
  setValue: UseFormSetValue<FormItemState>;
}

// Component for managing a set of EnableWhen conditions, and the Enable Behavior (AND/OR).
// This is used both for managing visibility (item.enableWhen) and managing whether to autofill (item.autofillValues.0.autofillWhen).
const ManageEnableWhen: React.FC<ManageEnableWhenProps> = ({
  control,
  itemMap,
  enableWhenPath = 'enableWhen',
  enableBehaviorPath = 'enableBehavior',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setValue,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: enableWhenPath,
  });

  const itemPickList = useItemPickList({ control, itemMap });

  const enableBehaviorOptions = useMemo(() => {
    const action = enableWhenPath.includes('autofillWhen')
      ? 'Autofill this value'
      : 'Display this item';
    return [
      {
        code: 'ALL',
        label: `${action} if all of the below conditions are met (AND logic)`,
      },
      {
        code: 'ANY',
        label: `${action} if any of the below conditions are met (OR logic)`,
      },
    ];
  }, [enableWhenPath]);

  const {
    field: { onChange: onChangeEnableBehavior },
  } = useController({
    control,
    name: enableBehaviorPath,
  });

  return (
    <CardGroup
      onAddItem={() => {
        // setValue(enableBehaviorPath, EnableBehavior.All);
        if (fields.length === 0) {
          // when adding first condition, set default enable behavior
          onChangeEnableBehavior('ALL');
        }
        append({}, { shouldFocus: false });
      }}
      addItemText='Add Condition'
    >
      {fields.length > 0 && (
        <ControlledRadioGroupInput
          name={enableBehaviorPath}
          control={control}
          required={true}
          options={enableBehaviorOptions}
          label={'Conditional Behavior (AND/OR)'}
        />
      )}
      {fields.map((condition, index) => (
        <RemovableCard
          key={JSON.stringify(condition)} // fixme could be non unique
          onRemove={() => remove(index)}
          removeTooltip={'Remove Condition'}
        >
          <EnableWhenCondition
            control={control}
            index={index}
            enableWhenPath={enableWhenPath}
            itemPickList={itemPickList}
            itemMap={itemMap}
          />
        </RemovableCard>
      ))}
    </CardGroup>
  );
};

export default ManageEnableWhen;
