import { Alert, Box, Button, Grid, Stack } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { shouldEnableItem } from '../formUtil';

import DynamicField from './DynamicField';

import {
  FormDefinitionJson,
  FormItem,
  ValidationError,
} from '@/types/gqlTypes';

export interface Props {
  definition: FormDefinitionJson;
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
  initialValues = {},
  errors,
}) => {
  const navigate = useNavigate();
  // Map { linkId => current value }
  const [values, setValues] = useState<Record<string, any>>(
    Object.assign({}, initialValues)
  );

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

  const isEnabled = (item: FormItem): boolean => {
    if (item.hidden) return false;
    if (!item.enableWhen) {
      // If it has nested items, only show if has any enabled children.
      // Otherwise, show it.
      return item.item ? item.item.some((i) => isEnabled(i)) : true;
    }

    return shouldEnableItem(item, values);
  };

  // Get errors for a particular field
  const getFieldErrors = useCallback(
    (item: FormItem) => {
      if (!errors) return undefined;
      if (!item.queryField) return undefined;
      const attribute = item.queryField;
      return errors.filter((e) => e.attribute === attribute);
    },
    [errors]
  );

  // Recursively render an item
  const renderItem = (item: FormItem, nestingLevel: number) => {
    const hidden = !isEnabled(item);
    // if (hidden && item.type === ItemType.group) {
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
              Please fix outstanding errors:
              <Box component='ul' sx={{ pl: 2 }}>
                {errors.map(({ message, fullMessage }) => (
                  <li key={fullMessage || message}>{fullMessage || message}</li>
                ))}
              </Box>
            </Alert>
          </Grid>
        )}
        {definition.item.map((item) => renderItem(item, 0))}
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
