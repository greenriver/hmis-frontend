import { Stack, Typography } from '@mui/material';
import Box from '@mui/system/Box/Box';
import { useMemo, useState } from 'react';
import { Controller, UseFormSetValue, useWatch } from 'react-hook-form';
import { FormItemControl, FormItemState } from '../types';
import ManageEnableWhen from './ManageEnableWhen';
import LabeledCheckbox from '@/components/elements/input/LabeledCheckbox';
import YesNoRadio from '@/components/elements/input/YesNoRadio';
import ControlledCheckbox from '@/modules/form/components/rhf/ControlledCheckbox';
import ControlledSelect from '@/modules/form/components/rhf/ControlledSelect';
import ControlledTextInput from '@/modules/form/components/rhf/ControlledTextInput';
import { usePickList } from '@/modules/form/hooks/usePickList';
import { ItemMap } from '@/modules/form/types';
import { determineAutofillField } from '@/modules/formBuilder/formBuilderUtil';
import { FormItem, ItemType } from '@/types/gqlTypes';

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
  const formulaValue = useWatch({
    control,
    name: `autofillValues.${index}.formula`,
  });
  const fieldType = useMemo(() => determineAutofillField(itemType), [itemType]);

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

  const { pickList: currentItemPickList = [], loading: pickListLoading } =
    usePickList({ item: pickListHookArgs });

  // Advanced behaviors that are toggled off by default, or on if either are set
  const [advanced, setAdvanced] = useState({
    useFormula: !!formulaValue,
  });

  return (
    <>
      <Typography sx={{ mb: 2 }}>{title}</Typography>

      <Stack gap={2}>
        <Typography variant='body2'>
          Enter the value to autofill, or enter a formula to calculate it:
        </Typography>

        {!advanced.useFormula && (
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

        {advanced.useFormula && (
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
            <LabeledCheckbox
              label='Use a formula'
              checked={advanced.useFormula}
              sx={{ width: 'fit-content' }}
              onChange={(evt, checked) =>
                setAdvanced((old) => ({ ...old, useFormula: checked }))
              }
            />
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
