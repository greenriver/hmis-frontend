import { Box, Button, Stack, Typography } from '@mui/material';
import { useCallback } from 'react';
import EnableWhenSelection from './EnableWhenSelection';
import { AddIcon } from '@/components/elements/SemanticIcons';
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
      <Typography>Autofill</Typography>
      <Box sx={{ border: '1px solid pink' }}>
        <Stack gap={2} sx={{ pt: 1 }}>
          {values.map((value, index) => (
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
          ))}
        </Stack>

        <Button
          onClick={addItem}
          color='secondary'
          variant='text'
          sx={{ width: 'fit-content', color: 'links', mb: 2 }}
          startIcon={<AddIcon />}
        >
          Add Autofill
        </Button>
      </Box>
    </>
  );
};

export default AutofillProperties;
