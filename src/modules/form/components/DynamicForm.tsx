import { Box, Grid, Button, Stack } from '@mui/material';
import React, { useState } from 'react';

import { shouldEnableItem } from '../formUtil';
import { FieldType, FormDefinition, Item } from '../types';

import DynamicField from './DynamicField';

interface Props {
  definition: FormDefinition;
  onSubmit: (values: Record<string, any>) => void;
  submitButtonText?: string;
  discardButtonText?: string;
  loading?: boolean;
  // validations
}

const DynamicForm: React.FC<Props> = ({
  definition,
  onSubmit,
  submitButtonText,
  discardButtonText,
  loading,
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

  const isEnabled = (item: Item) => {
    if (!item.enableWhen) return true;
    // We assume that all enableWhen conditions depend on the same question, for now, to speed things up (so we can skip immediately if there is no answer)
    const linkId = item.enableWhen[0]?.question;
    return shouldEnableItem(values[linkId], item);
  };

  const renderItem = (item: Item, nestingLevel: number) => {
    const hidden = !isEnabled(item);
    if (hidden && item.type === FieldType.group) {
      return null;
    }
    return (
      <DynamicField
        key={item.linkId}
        item={item}
        itemChanged={itemChanged}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        value={values[item.linkId] ?? ''}
        nestingLevel={nestingLevel}
        children={(item) => renderItem(item, nestingLevel + 1)}
        disabled={item.readOnly || hidden}
      />
    );
  };

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
        <Button variant='contained' type='submit' disabled={!!loading}>
          {loading ? 'Submitting...' : submitButtonText || 'Submit'}
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
