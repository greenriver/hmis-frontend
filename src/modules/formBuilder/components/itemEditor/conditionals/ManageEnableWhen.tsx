import { useMemo } from 'react';
import { Controller, useController, useFieldArray } from 'react-hook-form';
import { FormItemControl } from '../types';
import CardGroup, { RemovableCard } from './CardGroup';
import EnableWhenCondition from './EnableWhenCondition';
import { useItemPickList } from './useItemPickList';
import RadioGroupInput from '@/components/elements/input/RadioGroupInput';
import { ItemMap } from '@/modules/form/types';

export interface ManageEnableWhenProps {
  control: FormItemControl;
  itemMap: ItemMap;
  enableWhenPath?: 'enableWhen' | `autofillValues.${number}.autofillWhen`; // path to enableWhen in form
  enableBehaviorPath?:
    | 'enableBehavior'
    | `autofillValues.${number}.autofillBehavior`;
}

// Component for managing a set of EnableWhen conditions, and the Enable Behavior (AND/OR).
// This is used both for managing visibility (item.enableWhen) and managing whether to autofill (item.autofillValues.0.autofillWhen).
const ManageEnableWhen: React.FC<ManageEnableWhenProps> = ({
  control,
  itemMap,
  enableWhenPath = 'enableWhen',
  enableBehaviorPath = 'enableBehavior',
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: enableWhenPath,
  });
  const {
    field: { onChange: onChangeEnableBehavior },
  } = useController({
    control,
    name: enableBehaviorPath,
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

  return (
    <CardGroup
      onAddItem={() => {
        if (fields.length === 0) {
          // when adding first condition, set default enable behavior
          onChangeEnableBehavior('ALL');
        }
        append({}, { shouldFocus: false });
      }}
      addItemText='Add Condition'
    >
      {fields.length > 0 && (
        <Controller
          name={enableBehaviorPath}
          control={control}
          rules={{ required: 'This field is required' }}
          shouldUnregister // clear value when unmounted
          render={({
            field: { ref, value, onChange, ...field },
            fieldState: { error },
          }) => (
            <RadioGroupInput
              options={enableBehaviorOptions}
              label='Conditional Behavior (AND/OR)'
              value={enableBehaviorOptions.find((o) => o.code === value)}
              onChange={(option) => onChange(option?.code)}
              {...field}
              error={!!error}
              helperText={error?.message}
            />
          )}
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
