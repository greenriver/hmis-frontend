import { Stack, Typography } from '@mui/material';
import Box from '@mui/system/Box/Box';
import { useMemo, useState } from 'react';
import { Controller, UseFormSetValue, useWatch } from 'react-hook-form';
import { FormItemControl, FormItemState } from '../types';
import ManageEnableWhen from './ManageEnableWhen';
import LabeledCheckbox from '@/components/elements/input/LabeledCheckbox';
import NumberInput from '@/components/elements/input/NumberInput';
import YesNoRadio from '@/components/elements/input/YesNoRadio';
import ControlledCheckbox from '@/modules/form/components/rhf/ControlledCheckbox';
import ControlledTextInput from '@/modules/form/components/rhf/ControlledTextInput';
import { ItemMap } from '@/modules/form/types';
import { determineAutofillField } from '@/modules/formBuilder/formBuilderUtil';
import { ItemType } from '@/types/gqlTypes';

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
              <ControlledTextInput
                name={`autofillValues.${index}.valueCode`}
                label='Value'
                control={control}
                required
              />
            )}
            {fieldType === 'valueBoolean' && (
              <Controller
                name={`autofillValues.${index}.valueBoolean`}
                control={control}
                shouldUnregister
                rules={{ required: 'This field is required' }}
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
              <Controller
                name={`autofillValues.${index}.valueNumber`}
                control={control}
                shouldUnregister
                rules={{ required: 'This field is required' }}
                render={({
                  field: { ref, disabled, ...field },
                  fieldState: { error },
                }) => (
                  <NumberInput
                    sx={disabled ? { display: 'none' } : undefined}
                    label='Value'
                    inputRef={ref}
                    error={!!error}
                    helperText={error?.message}
                    {...field}
                  />
                )}
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
