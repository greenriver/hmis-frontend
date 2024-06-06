import { Box, Stack, Typography } from '@mui/material';
import { Controller, useFieldArray } from 'react-hook-form';
import CardGroup, { RemovableCard } from './CardGroup';
import EnableWhenSelection from './EnableWhenSelection';
import { FormItemControl } from './itemEditor/types';
import LabeledCheckbox from '@/components/elements/input/LabeledCheckbox';
import NumberInput from '@/components/elements/input/NumberInput';
import TextInput from '@/components/elements/input/TextInput';
import YesNoRadio from '@/components/elements/input/YesNoRadio';
import { ItemMap } from '@/modules/form/types';
import { ItemType } from '@/types/gqlTypes';

interface AutofillValueCardProps {
  control: FormItemControl;
  index: number;
  itemMap: ItemMap;
  title: string;
  itemType: ItemType;
}
const AutofillValueCard: React.FC<AutofillValueCardProps> = ({
  control,
  index,
  itemMap,
  title,
  itemType,
}) => {
  //TODO: also accept sum_questions for autofilling numeric fields using a sum of other questions

  return (
    <>
      <Typography sx={{ mb: 2 }}>{title}</Typography>

      <Stack gap={2}>
        <Typography variant='body2'>
          Enter the value to autofill, or enter a formula to calculate it:
        </Typography>

        <Controller
          name={`autofillValues.${index}.valueCode`}
          control={control}
          disabled={
            ![ItemType.Choice, ItemType.OpenChoice, ItemType.String].includes(
              itemType
            )
          }
          render={({ field: { ref, disabled, ...field } }) => (
            <TextInput
              sx={disabled ? { display: 'none' } : undefined}
              label='Value (String / Code)'
              inputRef={ref}
              disabled={disabled}
              {...field}
            />
          )}
        />
        <Controller
          name={`autofillValues.${index}.valueBoolean`}
          control={control}
          disabled={itemType !== ItemType.Boolean}
          render={({ field: { ref, disabled, ...field } }) => (
            <YesNoRadio
              label='Value (Boolean)'
              sx={disabled ? { display: 'none' } : { mt: 3, ml: 2 }}
              {...field}
            />
          )}
        />
        <Controller
          name={`autofillValues.${index}.valueNumber`}
          control={control}
          disabled={![ItemType.Currency, ItemType.Integer].includes(itemType)}
          render={({ field: { ref, disabled, ...field } }) => (
            <NumberInput
              sx={disabled ? { display: 'none' } : undefined}
              label='Value (Numeric)'
              inputRef={ref}
              {...field}
            />
          )}
        />
        <Controller
          name={`autofillValues.${index}.formula`}
          control={control}
          // TODO: validate formula
          // disabled={!answerInputTypes.includes('answerCode')}
          render={({ field: { ref, disabled, ...field } }) => (
            <TextInput
              sx={disabled ? { display: 'none' } : undefined}
              label='Value (Formula)'
              helperText="Formula to calculate the value to fill. Use 'value' to refer to the value of the current item."
              inputRef={ref}
              disabled={disabled}
              {...field}
            />
          )}
        />

        <Controller
          name={`autofillValues.${index}.autofillReadonly`}
          control={control}
          render={({ field: { ref, ...field } }) => (
            <LabeledCheckbox
              label='Autofill in read-only mode'
              inputRef={ref}
              {...field}
            />
          )}
        />

        <EnableWhenSelection
          enableWhenPath={`autofillValues.${index}.autofillWhen`}
          enableBehaviorPath={`autofillValues.${index}.autofillBehavior`}
          control={control}
          itemMap={itemMap}
        />
      </Stack>
    </>
  );
};

interface AutofillPropertiesProps {
  control: FormItemControl;
  itemMap: ItemMap;
  itemType: ItemType;
}

const AutofillProperties: React.FC<AutofillPropertiesProps> = ({
  control,
  itemType,
  itemMap,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'autofillValues',
  });

  return (
    <>
      <Typography variant='h5'>Autofill</Typography>
      <Box sx={{ mb: 2 }}>
        <CardGroup
          onAddItem={() => append({})}
          addItemText='Add Autofill Value'
        >
          {fields.map((value, index) => (
            <RemovableCard
              onRemove={() => remove(index)}
              removeTooltip='Remove Autofill'
            >
              <AutofillValueCard
                title={`Autofill Value ${index + 1}`}
                index={index}
                control={control}
                itemMap={itemMap}
                itemType={itemType}
              />
            </RemovableCard>
          ))}
        </CardGroup>
      </Box>
    </>
  );
};

export default AutofillProperties;
