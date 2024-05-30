import { Box, Stack, Typography } from '@mui/material';
import { useCallback, useMemo } from 'react';
import CardGroup, { RemovableCard } from './CardGroup';
import EnableWhenSelection from './EnableWhenSelection';
import DebouncedTextInput from '@/components/elements/input/DebouncedTextInput';
import LabeledCheckbox from '@/components/elements/input/LabeledCheckbox';
import NumberInput from '@/components/elements/input/NumberInput';
import YesNoRadio from '@/components/elements/input/YesNoRadio';
import { ItemMap } from '@/modules/form/types';
import {
  AutofillValue,
  EnableBehavior,
  EnableWhen,
  ItemType,
} from '@/types/gqlTypes';

interface AutofillValueCardProps {
  value: AutofillValue;
  onChange: (value: AutofillValue) => void;
  itemMap: ItemMap;
  title: string;
  itemType: ItemType;
}
const AutofillValueCard: React.FC<AutofillValueCardProps> = ({
  value,
  onChange,
  itemMap,
  title,
  itemType,
}) => {
  const handleChangeValue = useCallback(
    (field: keyof AutofillValue, val: any) => {
      onChange({
        ...value,
        formula: null,
        valueCode: null,
        valueBoolean: null,
        valueNumber: null,
        sumQuestions: null,
        [field]: val,
      });
    },
    [onChange, value]
  );

  const valueComponent = useMemo(() => {
    switch (itemType) {
      case ItemType.Integer:
      case ItemType.Currency:
        {
          /* TODO: also accept sum_questions for autofilling numeric fields using a sum of other questions */
        }
        return (
          <NumberInput
            label='Value (Numeric)'
            onChange={(e) => handleChangeValue('valueNumber', e.target.value)}
          />
        );
      case ItemType.Boolean:
        return (
          <YesNoRadio
            label='Value (Boolean)'
            value={value.valueBoolean}
            onChange={(v) => handleChangeValue('valueBoolean', v)}
          />
        );
      default:
        return (
          <DebouncedTextInput
            label='Value (String / Code)'
            value={value.valueCode || ''}
            onChange={(str) => handleChangeValue('valueCode', str)}
          />
        );
    }
  }, [handleChangeValue, itemType, value.valueBoolean, value.valueCode]);

  return (
    <>
      <Typography sx={{ mb: 2 }}>{title}</Typography>

      <Stack gap={2}>
        <Typography variant='body2'>
          Enter the value to autofill, or enter a formula to calculate it:
        </Typography>
        {valueComponent}
        <DebouncedTextInput
          label='Value (Formula)'
          value={value.formula || ''}
          onChange={(str) => handleChangeValue('formula', str)}
          // TODO: validate formula
          helperText="Formula to calculate the value to fill. Use 'value' to refer to the value of the current item."
        />
        <LabeledCheckbox
          label='Autofill in read-only mode'
          checked={!!value.autofillReadonly}
          sx={{ typography: { variant: 'body2' } }}
          onChange={(e) =>
            onChange({
              ...value,
              autofillReadonly: (e.target as HTMLInputElement).checked,
            })
          }
        />
        <EnableWhenSelection
          enableBehavior={value.autofillBehavior}
          onChangeEnableBehavior={(behavior) =>
            onChange({ ...value, autofillBehavior: behavior })
          }
          conditions={value.autofillWhen || []}
          onChange={(conditions) =>
            onChange({ ...value, autofillWhen: conditions as EnableWhen[] })
          }
          itemMap={itemMap}
          variant='autofill'
        />
      </Stack>
    </>
  );
};

interface AutofillPropertiesProps {
  values: AutofillValue[];
  onChange: (values: AutofillValue[]) => void;
  itemMap: ItemMap;
  itemType: ItemType;
}

const AutofillProperties: React.FC<AutofillPropertiesProps> = ({
  itemType,
  values,
  onChange,
  itemMap,
}) => {
  const addItem = useCallback(() => {
    const adjusted: AutofillValue[] = [
      ...values,
      {
        autofillBehavior: EnableBehavior.Any,
        autofillWhen: [{} as EnableWhen],
      },
    ];
    onChange(adjusted);
  }, [values, onChange]);

  return (
    <>
      <Typography variant='h5'>Autofill</Typography>
      <Box sx={{ mb: 2 }}>
        <CardGroup onAddItem={addItem} addItemText='Add Autofill Rule'>
          {(values || []).map((value, index) => (
            <RemovableCard
              onRemove={() => {
                const adjusted = [...values];
                adjusted.splice(index, 1);
                onChange(adjusted);
              }}
              removeTooltip='Remove Autofill'
            >
              <AutofillValueCard
                title={`Autofill Rule ${index + 1}`}
                value={value}
                onChange={(v) => {
                  const adjusted = [...values];
                  adjusted[index] = v;
                  onChange(adjusted);
                }}
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
