import { Box, Grid, Button, Stack } from '@mui/material';
import React, { useState } from 'react';

import { FormDefinition, Item } from '../types';

import DynamicField from './DynamicField';

interface Props {
  definition: FormDefinition;
  onSubmit: (values: Record<string, any>) => void;
  submitButtonText?: string;
  discardButtonText?: string;
}

const DynamicForm: React.FC<Props> = ({
  definition,
  onSubmit,
  submitButtonText,
  discardButtonText,
}) => {
  // Map { linkId => current value }
  const [values, setValues] = useState<Record<string, any>>({});

  // this needs to be memoized
  const itemChanged = (linkId: string, value: any) => {
    setValues((currentValues) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      currentValues[linkId] = value;
      return { ...currentValues };
    });
  };

  const submitHandler = (
    event: React.FormEvent<HTMLFormElement> | React.KeyboardEvent
  ) => {
    event.preventDefault();
    onSubmit(values);
  };

  const renderItem = (item: Item, nestingLevel: number) => (
    <DynamicField
      key={item.linkId}
      item={item}
      itemChanged={itemChanged}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      value={values[item.linkId] ?? ''}
      nestingLevel={nestingLevel}
      children={(item) => renderItem(item, nestingLevel + 1)}
    />
  );

  return (
    <Box component='form' onSubmit={submitHandler} sx={{ mt: 4, pb: 2 }}>
      <Grid
        container
        // direction='row'
        direction='column'
        rowSpacing={2}
        columnSpacing={2}
        sx={{ mb: 2 }}
      >
        {definition?.item.map((item) => renderItem(item, 0))}
      </Grid>
      <Stack direction='row' spacing={1} sx={{ mt: 4 }}>
        <Button variant='contained' type='submit'>
          {submitButtonText || 'Submit'}
        </Button>
        {/* <Button variant='outlined'>Save Draft</Button> */}
        <Button variant='outlined'>{discardButtonText || 'Discard'}</Button>
        {/* <Link
            onClick={() => {
              setValues({});
            }}
            variant='caption'
            sx={{ display: 'block', pt: 1, pl: 2 }}
          >
            Save Draft
          </Link> */}
      </Stack>
    </Box>
  );
};

export default DynamicForm;
