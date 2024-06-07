import { Stack, Typography } from '@mui/material';
import { Controller } from 'react-hook-form';
import { FormItemControl } from '../types';
import ManageEnableWhen from './ManageEnableWhen';
import NumberInput from '@/components/elements/input/NumberInput';
import RhfCheckbox from '@/components/elements/input/RhfCheckbox';
import RhfTextInput from '@/components/elements/input/RhfTextInput';
import YesNoRadio from '@/components/elements/input/YesNoRadio';
import { ItemMap } from '@/modules/form/types';
import { ItemType } from '@/types/gqlTypes';

interface AutofillValueCardProps {
  control: FormItemControl;
  index: number;
  itemMap: ItemMap;
  title: string;
  itemType: ItemType; // will be used to determine value type
}

// Card for managing a single AutofillValue
const AutofillValueCard: React.FC<AutofillValueCardProps> = ({
  control,
  index,
  itemMap,
  title,
}) => {
  //TODO: also accept sum_questions for autofilling numeric fields using a sum of other questions

  return (
    <>
      <Typography sx={{ mb: 2 }}>{title}</Typography>

      <Stack gap={2}>
        <Typography variant='body2'>
          Enter the value to autofill, or enter a formula to calculate it:
        </Typography>

        <RhfTextInput
          name={`autofillValues.${index}.valueCode`}
          label='Value (String / Code)'
          control={control}
          // disabled={[
          //   ItemType.Boolean,
          //   ItemType.Currency,
          //   ItemType.Integer,
          // ].includes(itemType)}
        />
        <Controller
          name={`autofillValues.${index}.valueBoolean`}
          control={control}
          // disabled={itemType !== ItemType.Boolean}
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
          // disabled={![ItemType.Currency, ItemType.Integer].includes(itemType)}
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
        <RhfTextInput
          name={`autofillValues.${index}.formula`}
          control={control}
          // TODO: validate formula
          // disabled={!answerInputTypes.includes('answerCode')}
          label='Value (Formula)'
          helperText="Formula to calculate the value to fill. Use 'value' to refer to the value of the current item."
        />
        <RhfCheckbox
          name={`autofillValues.${index}.autofillReadonly`}
          control={control}
          label='Autofill in read-only mode'
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
