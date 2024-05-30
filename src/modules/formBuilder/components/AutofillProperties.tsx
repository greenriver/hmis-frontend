import { Box, Typography } from '@mui/material';
import { useCallback } from 'react';
import CardGroup, { RemovableCard } from './CardGroup';
import EnableWhenSelection from './EnableWhenSelection';
import { ItemMap } from '@/modules/form/types';
import {
  AutofillValue,
  EnableBehavior,
  EnableOperator,
} from '@/types/gqlTypes';

interface AutofillPropertiesProps {
  values: AutofillValue[];
  onChange: (values: AutofillValue[]) => void;
  itemMap: ItemMap;
}

const AutofillProperties: React.FC<AutofillPropertiesProps> = ({
  values,
  onChange,
  itemMap,
}) => {
  const addItem = useCallback(() => {
    const adjusted: AutofillValue[] = [
      ...values,
      {
        autofillBehavior: EnableBehavior.Any,
        autofillWhen: [{ operator: EnableOperator.Equal }],
      },
    ];
    onChange(adjusted);
  }, [values, onChange]);

  return (
    <>
      <Typography variant='h5'>Autofill</Typography>
      <Box sx={{ mb: 2 }}>
        <CardGroup onAddItem={addItem} addItemText='Add Autofill Rule'>
          {values.map((value, index) => (
            <RemovableCard
              onRemove={() => {
                const adjusted = [...values];
                adjusted.splice(index, 1);
                onChange(adjusted);
              }}
              removeTooltip={'Remove Autofill'}
            >
              <Typography>Rule {index + 1}</Typography>
              <>TODO: VALUE TO AUTOFILL</>
              <EnableWhenSelection
                enableBehavior={value.autofillBehavior}
                onChangeEnableBehavior={(behavior) => {
                  const adjusted = [...values];
                  adjusted[index].autofillBehavior = behavior;
                  onChange(adjusted);
                }}
                conditions={value.autofillWhen}
                onChange={(conditions) => {
                  const adjusted = [...values];
                  adjusted[index].autofillWhen = conditions;
                  onChange(adjusted);
                }}
                itemMap={itemMap}
              />
            </RemovableCard>
          ))}
        </CardGroup>
      </Box>
    </>
  );
};

export default AutofillProperties;
