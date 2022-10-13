import { Alert, Box, Button, Grid, Stack } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { shouldEnableItem } from '../formUtil';
import { FormDefinition, Item } from '../types';

import DynamicField from './DynamicField';

import { ValidationError } from '@/types/gqlTypes';

export interface Props {
  definition: FormDefinition;
  mappingKey?: string; // mapping key in form definition, used to map errors to Items
  onSubmit: (values: Record<string, any>) => void;
  submitButtonText?: string;
  discardButtonText?: string;
  loading?: boolean;
  initialValues?: Record<string, any>;
  errors?: ValidationError[];
}

const DynamicForm: React.FC<Props> = ({
  definition,
  onSubmit,
  submitButtonText,
  discardButtonText,
  loading,
  mappingKey,
  initialValues = {},
  errors,
}) => {
  const navigate = useNavigate();
  // Map { linkId => current value }
  const [values, setValues] = useState<Record<string, any>>(initialValues);

  if (errors) console.log('Validation errors', errors);

  const itemChanged = useCallback(
    (linkId: string, value: any) => {
      setValues((currentValues) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        currentValues[linkId] = value;
        return { ...currentValues };
      });
    },
    [setValues]
  );

  const submitHandler = (
    event: React.FormEvent<HTMLFormElement> | React.KeyboardEvent
  ) => {
    event.preventDefault();
    onSubmit(values);
  };

  const isEnabled = (item: Item): boolean => {
    if (item.hidden) return false;
    if (!item.enableWhen) {
      // If it has nested items, only show if has any enabled children.
      // Otherwise, show it.
      return item.item ? item.item.some((i) => isEnabled(i)) : true;
    }

    // We assume that all enableWhen conditions depend on the same question, for now, to speed things up (so we can skip immediately if there is no answer)
    const linkId = item.enableWhen[0]?.question;
    return shouldEnableItem(values[linkId], item);
  };

  // Get errors for a particular field
  const getFieldErrors = useCallback(
    (item: Item) => {
      if (!errors || !mappingKey) return undefined;
      if (!item.mapping || !item.mapping[mappingKey]) return undefined;
      const attribute = item.mapping[mappingKey];
      return errors.filter((e) => e.attribute === attribute);
    },
    [errors, mappingKey]
  );

  // Recursively render an item
  const renderItem = (item: Item, nestingLevel: number) => {
    const hidden = !isEnabled(item);
    // if (hidden && item.type === FieldType.group) {
    if (hidden) {
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
        errors={getFieldErrors(item)}
      />
    );
  };

  return (
    <Box component='form' onSubmit={submitHandler}>
      <Grid container direction='column' spacing={2}>
        {errors && (
          <Grid item>
            <Alert severity='error' sx={{ mb: 1 }}>
              Please fix outstanding errors.
            </Alert>
          </Grid>
        )}
        {definition?.item.map((item) => renderItem(item, 0))}
      </Grid>
      <Stack direction='row' spacing={1} sx={{ mt: 3 }}>
        <Button variant='contained' type='submit' disabled={!!loading}>
          {loading ? 'Submitting...' : submitButtonText || 'Submit'}
        </Button>
        {/* <Button variant='outlined'>Save Draft</Button> */}
        <Button variant='gray' onClick={() => navigate(-1)}>
          {discardButtonText || 'Discard'}
        </Button>
      </Stack>
    </Box>
  );
};

export default DynamicForm;
