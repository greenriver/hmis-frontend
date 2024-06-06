import { Stack, Typography } from '@mui/material';
import { Controller } from 'react-hook-form';
import { FormItemControl } from '../types';
import ManageEnableWhen from './ManageEnableWhen';
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

// Card for managing a single AutofillValue
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
          disabled={[
            ItemType.Boolean,
            ItemType.Currency,
            ItemType.Integer,
          ].includes(itemType)}
          render={({
            field: { ref, disabled, ...field },
            fieldState: { error },
          }) => (
            <TextInput
              sx={disabled ? { display: 'none' } : undefined}
              label='Value (String / Code)'
              inputRef={ref}
              disabled={disabled}
              error={!!error}
              helperText={error?.message}
              {...field}
            />
          )}
        />
        <Controller
          name={`autofillValues.${index}.valueBoolean`}
          control={control}
          disabled={itemType !== ItemType.Boolean}
          render={({
            field: { ref, disabled, ...field },
            fieldState: { error },
          }) => (
            <YesNoRadio
              label='Value (Boolean)'
              sx={disabled ? { display: 'none' } : {}}
              error={!!error}
              helperText={error?.message}
              {...field}
            />
          )}
        />
        <Controller
          name={`autofillValues.${index}.valueNumber`}
          control={control}
          disabled={![ItemType.Currency, ItemType.Integer].includes(itemType)}
          render={({
            field: { ref, disabled, ...field },
            fieldState: { error },
          }) => (
            <NumberInput
              sx={disabled ? { display: 'none' } : undefined}
              label='Value (Numeric)'
              inputRef={ref}
              error={!!error}
              helperText={error?.message}
              {...field}
            />
          )}
        />
        <Controller
          name={`autofillValues.${index}.formula`}
          control={control}
          // TODO: validate formula
          // disabled={!answerInputTypes.includes('answerCode')}
          render={({
            field: { ref, disabled, ...field },
            fieldState: { error },
          }) => (
            <TextInput
              sx={disabled ? { display: 'none' } : undefined}
              label='Value (Formula)'
              helperText="Formula to calculate the value to fill. Use 'value' to refer to the value of the current item."
              inputRef={ref}
              disabled={disabled}
              error={!!error}
              helperText={error?.message}
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

        <ManageEnableWhen
          enableWhenPath={`autofillValues.${index}.autofillWhen`}
          enableBehaviorPath={`autofillValues.${index}.autofillBehavior`}
          control={control}
          itemMap={itemMap}
        />
      </Stack>
    </>
  );
};

export default AutofillValueCard;
