import { Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { useMemo, useState } from 'react';
import { Controller, useFieldArray, useWatch } from 'react-hook-form';
import { FormItemControl } from '../types';
import { useLocalConstantsPickList } from '../useLocalConstantsPickList';
import CardGroup, { RemovableCard } from './CardGroup';
import LabeledCheckbox from '@/components/elements/input/LabeledCheckbox';
import RadioGroupInput from '@/components/elements/input/RadioGroupInput';
import YesNoRadio from '@/components/elements/input/YesNoRadio';
import ControlledSelect from '@/modules/form/components/rhf/ControlledSelect';
import ControlledTextInput from '@/modules/form/components/rhf/ControlledTextInput';
import { localResolvePickList } from '@/modules/form/util/formUtil';
import { InitialBehavior, ItemType, PickListOption } from '@/types/gqlTypes';

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
  const pickListOptions = useWatch({ control, name: 'pickListOptions' });
  const pickListReference = useWatch({ control, name: 'pickListReference' });
  const hasLocalConstant = !!useWatch({
    control,
    name: 'initial.0.valueLocalConstant',
  });

  const pickList = useMemo(() => {
    if (pickListOptions) return pickListOptions as PickListOption[];
    if (pickListReference) {
      // TODO: could use usePickList to fetch remote pick list. This will only resolve local enums.
      return localResolvePickList(pickListReference) || undefined;
    }
  }, [pickListOptions, pickListReference]);

  const localConstantsPickList = useLocalConstantsPickList();

  // Using a "Local Constant" to set the intial value is off by default, unless this is a date field
  // or the local constant is already set.
  const [advanced, setAdvanced] = useState({
    localConstant: hasLocalConstant || itemType === ItemType.Date,
  });

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
                shouldUnregister
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
              {!advanced.localConstant && (
                <>
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
                      shouldUnregister
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
                </>
              )}
              {advanced.localConstant && (
                <ControlledSelect
                  name='initial.0.valueLocalConstant'
                  control={control}
                  label='Local Constant'
                  placeholder='Select local constant'
                  options={localConstantsPickList}
                  helperText='Set initial value based on a local constant'
                />
              )}
              <Box sx={{ mt: 2 }}>
                <Typography typography='body2' fontWeight={600}>
                  Advanced Options
                </Typography>
                <Stack>
                  <LabeledCheckbox
                    label='Initialize using a Local Constant'
                    checked={advanced.localConstant}
                    sx={{ typography: { variant: 'body2' } }}
                    onChange={(evt, checked) =>
                      setAdvanced((old) => ({ ...old, localConstant: checked }))
                    }
                  />
                </Stack>
              </Box>
            </Stack>
          </RemovableCard>
        ))}
      </CardGroup>
    </>
  );
};

export default InitialValue;
