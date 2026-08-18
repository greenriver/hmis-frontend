import { Stack, Typography } from '@mui/material';
import Box from '@mui/system/Box/Box';
import { useCallback, useMemo, useState } from 'react';
import { Controller, UseFormSetValue, useWatch } from 'react-hook-form';
import { FormItemControl, FormItemState } from '../types';
import ManageEnableWhen from './ManageEnableWhen';
import { useItemPickList } from './useItemPickList';
import RadioGroupInput from '@/components/elements/input/RadioGroupInput';
import YesNoRadio from '@/components/elements/input/YesNoRadio';
import ControlledCheckbox from '@/modules/form/components/rhf/ControlledCheckbox';
import ControlledSelect from '@/modules/form/components/rhf/ControlledSelect';
import ControlledTextInput from '@/modules/form/components/rhf/ControlledTextInput';
import { usePickList } from '@/modules/form/hooks/usePickList';
import { ItemMap } from '@/modules/form/types';
import {
  determineAutofillField,
  isCompatibleAutofillValueQuestion,
} from '@/modules/formBuilder/formBuilderUtil';
import { FormItem, ItemType, PickListOption } from '@/types/gqlTypes';

const AUTOFILL_VALUE_SOURCE_FIELDS = [
  'valueCode',
  'valueBoolean',
  'valueNumber',
  'formula',
  'valueQuestion',
] as const;

const AUTOFILL_TYPE_OPTIONS: PickListOption[] = [
  { code: 'static', label: 'A static value' },
  { code: 'question', label: 'Another question' },
  { code: 'formula', label: 'A formula' },
];

type AutofillType = 'static' | 'question' | 'formula';

interface AutofillValueCardProps {
  control: FormItemControl;
  index: number;
  itemMap: ItemMap;
  title: string;
  itemType: ItemType; // will be used to determine value type
  setValue: UseFormSetValue<FormItemState>;
}

// Card for managing a single AutofillValue
const AutofillValueCard: React.FC<AutofillValueCardProps> = ({
  control,
  index,
  itemMap,
  title,
  itemType,
  setValue,
}) => {
  //TODO: also accept sum_questions for autofilling numeric fields using a sum of other questions
  const [formulaValue, valueQuestion] = useWatch({
    control,
    name: [
      `autofillValues.${index}.formula`,
      `autofillValues.${index}.valueQuestion`,
    ],
  });
  const fieldType = useMemo(() => determineAutofillField(itemType), [itemType]);

  const [autofillType, setAutofillType] = useState<AutofillType>(() => {
    // Set the initial autofill type based on the existing autofill clause, if there is one; default to static
    if (formulaValue) return 'formula';
    if (valueQuestion) return 'question';
    return 'static';
  });

  // Get the current set of PickListOptions for the item (if any) to populate the autofill value dropdown
  const pickListOptions = useWatch({ control, name: 'pickListOptions' });
  const pickListReference = useWatch({ control, name: 'pickListReference' });
  const pickListHookArgs = useMemo(
    () =>
      ({
        linkId: 'fake',
        type: itemType,
        pickListOptions,
        pickListReference,
      }) as FormItem,
    [itemType, pickListOptions, pickListReference]
  );

  // For static autofill: Picklist of options for the current item, if it is a choice item
  const { pickList: currentItemPickList = [], loading: pickListLoading } =
    usePickList({ item: pickListHookArgs });

  // For autofilling from another question: Picklist of other items in the form, filtered to only include compatible items
  const itemPickList = useItemPickList({
    control,
    itemMap,
    filterItems: (item) => isCompatibleAutofillValueQuestion(item, itemType),
  });

  // When the autofill type changes, reset value fields to null, since the backend validates that only one autofill value field is present
  const handleAutofillTypeChange = useCallback(
    (option?: PickListOption | null) => {
      if (!option) return;
      const nextType = option.code as AutofillType;
      if (nextType === autofillType) return;

      setAutofillType(nextType);

      AUTOFILL_VALUE_SOURCE_FIELDS.forEach((field) => {
        setValue(`autofillValues.${index}.${field}`, null, {
          shouldDirty: true,
        });
      });
    },
    [autofillType, index, setValue]
  );

  return (
    <>
      <Typography sx={{ mb: 2 }}>{title}</Typography>

      <Stack gap={2}>
        <RadioGroupInput
          options={AUTOFILL_TYPE_OPTIONS}
          label='Autofill from:'
          value={AUTOFILL_TYPE_OPTIONS.find((o) => o.code === autofillType)}
          onChange={handleAutofillTypeChange}
        />

        {autofillType === 'static' && (
          <>
            {fieldType === 'valueCode' && (
              <>
                {currentItemPickList.length > 0 || pickListLoading ? (
                  <ControlledSelect
                    loading={pickListLoading}
                    name={`autofillValues.${index}.valueCode`}
                    label='Value'
                    control={control}
                    options={currentItemPickList}
                    placeholder='Select an option'
                    required
                  />
                ) : (
                  <ControlledTextInput
                    name={`autofillValues.${index}.valueCode`}
                    label='Value'
                    control={control}
                    required
                  />
                )}
              </>
            )}
            {fieldType === 'valueBoolean' && (
              <Controller
                name={`autofillValues.${index}.valueBoolean`}
                control={control}
                shouldUnregister
                // RHF `required` treats boolean `false` as empty, so validate true/false explicitly
                rules={{
                  validate: (val) =>
                    val === true || val === false || 'This field is required',
                }}
                render={({
                  field: { ref, disabled, ...field },
                  fieldState: { error },
                }) => (
                  <YesNoRadio
                    label='Yes/No Value'
                    sx={disabled ? { display: 'none' } : {}}
                    error={!!error}
                    helperText={error?.message}
                    {...field}
                  />
                )}
              />
            )}
            {fieldType === 'valueNumber' && (
              <ControlledTextInput
                name={`autofillValues.${index}.valueNumber`}
                control={control}
                label='Value (Numeric)'
                type='number'
                required
              />
            )}
          </>
        )}

        {autofillType === 'question' && (
          <ControlledSelect
            name={`autofillValues.${index}.valueQuestion`}
            label='Source Question'
            control={control}
            options={itemPickList}
            placeholder='Select a question'
            helperText='This item will be filled with the answer from the selected question.'
            required
          />
        )}

        {autofillType === 'formula' && (
          <ControlledTextInput
            name={`autofillValues.${index}.formula`}
            control={control}
            // TODO: validate formula
            label='Formula'
            helperText="Formula to calculate the value to fill. Use 'value' to refer to the value of the current item."
            required
          />
        )}

        <Box sx={{ mt: 2 }}>
          <Typography typography='body2' fontWeight={600}>
            Advanced Options
          </Typography>
          <Stack>
            <ControlledCheckbox
              name={`autofillValues.${index}.autofillReadonly`}
              control={control}
              label='Autofill in read-only mode'
              sx={{ width: 'fit-content' }}
            />
          </Stack>
        </Box>

        {/* The user can specify contitional rules for this Autofill value. For example: "Autofill to <true> only WHEN the answer to a previous question was >100". Those conditions use the same shape as EnableWhen visibility conditions, so we use the same component for managing them. */}
        <ManageEnableWhen
          enableWhenPath={`autofillValues.${index}.autofillWhen`}
          enableBehaviorPath={`autofillValues.${index}.autofillBehavior`}
          control={control}
          itemMap={itemMap}
          setValue={setValue}
        />
      </Stack>
    </>
  );
};

export default AutofillValueCard;
