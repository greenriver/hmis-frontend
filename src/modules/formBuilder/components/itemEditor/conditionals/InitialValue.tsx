import { Stack } from '@mui/system';
import { Controller, useFieldArray, useWatch } from 'react-hook-form';
import { FormItemControl } from '../types';
import { useLocalConstantsPickList } from '../useLocalConstantsPickList';
import CardGroup, { RemovableCard } from './CardGroup';
import RadioGroupInput from '@/components/elements/input/RadioGroupInput';
import YesNoRadio from '@/components/elements/input/YesNoRadio';
import ControlledSelect from '@/modules/form/components/rhf/ControlledSelect';
import ControlledTextInput from '@/modules/form/components/rhf/ControlledTextInput';
import { localResolvePickList } from '@/modules/form/util/formUtil';
import { InitialBehavior, ItemType } from '@/types/gqlTypes';

interface Props {
  itemType: ItemType;
  control: FormItemControl;
}

const initialBehaviorOptions = [
  {
    code: InitialBehavior.IfEmpty,
    label: 'Only set initial value if the field is empty',
  },
  {
    code: InitialBehavior.Overwrite,
    label:
      'Always set initial value when opening the form, even if the field already has a value',
  },
];

// component for managing the `initial` field of an item. this only handles the object at index 0.
// it is an array in order to support multiple initial values for a multi-select, but that functionality
// is not yet used, and not yet supported on the front-end (see TODO on getInitialValues in formUtil)
const InitialValue: React.FC<Props> = ({ itemType, control }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'initial',
  });
  const pickListReference = useWatch({ control, name: 'pickListReference' });

  // fixme: could use usePickList to fetch remote pick list. should also respect pickListOptions that are defined inline in the item
  const pickList = pickListReference
    ? localResolvePickList(pickListReference)
    : undefined;

  const localConstantsPickList = useLocalConstantsPickList();

  return (
    <>
      <CardGroup
        onAddItem={() => {
          append({}, { shouldFocus: true });
        }}
        addItemText='Add Initial Value'
        maxItems={1} // we only support one initial value currently, despite it being an array field
      >
        {fields.map((initial, index) => (
          <RemovableCard
            key={JSON.stringify(initial)} // fixme could be non unique
            onRemove={() => remove(index)}
            removeTooltip={'Remove Initial Value'}
          >
            <Stack gap={2}>
              <Controller
                name='initial.0.initialBehavior'
                control={control}
                defaultValue={InitialBehavior.IfEmpty}
                render={({ field: { ref, value, onChange, ...field } }) => (
                  <RadioGroupInput
                    options={initialBehaviorOptions}
                    label='Initial Behavior'
                    value={initialBehaviorOptions.find((o) => o.code === value)}
                    onChange={(option) => onChange(option?.code)}
                    {...field}
                  />
                )}
              />
              {[ItemType.Integer, ItemType.Currency].includes(itemType) && (
                <ControlledTextInput
                  name='initial.0.valueNumber'
                  control={control}
                  label='Initial Value (Numeric)'
                  type='number'
                />
              )}
              {itemType === ItemType.Boolean && (
                <Controller
                  name='initial.0.valueBoolean'
                  control={control}
                  render={({
                    field: { ref, ...field },
                    fieldState: { error },
                  }) => (
                    <YesNoRadio
                      label='Initial Value (Boolean)'
                      error={!!error}
                      helperText={error?.message}
                      {...field}
                    />
                  )}
                />
              )}
              {pickList && pickList.length > 0 ? (
                <ControlledSelect
                  name='initial.0.valueCode'
                  control={control}
                  label='Initial Value (Pick List)'
                  options={pickList}
                  placeholder='Select an option'
                />
              ) : (
                <ControlledTextInput
                  name='initial.0.valueCode'
                  control={control}
                  label='Initial Value'
                />
              )}
              <ControlledSelect
                name='initial.0.valueLocalConstant'
                control={control}
                label='Local Constant'
                placeholder='Select local constant'
                options={localConstantsPickList}
                helperText='Set initial value based on a local constant'
              />
            </Stack>
          </RemovableCard>
        ))}
      </CardGroup>
    </>
  );
};

export default InitialValue;
