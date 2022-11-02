import { Alert, Box, Button, Grid, Stack } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getBoundValue, getItemMap, shouldEnableItem } from '../util/formUtil';

import DynamicField, { DynamicInputCommonProps } from './DynamicField';

import {
  BoundType,
  FormDefinitionJson,
  FormItem,
  ValidationError,
} from '@/types/gqlTypes';

export interface Props {
  definition: FormDefinitionJson;
  onSubmit: (values: Record<string, any>) => void;
  onSaveDraft?: (values: Record<string, any>) => void;
  onDiscard?: () => void;
  submitButtonText?: string;
  saveDraftButtonText?: string;
  discardButtonText?: string;
  loading?: boolean;
  initialValues?: Record<string, any>;
  errors?: ValidationError[];
}

const DynamicForm: React.FC<Props> = ({
  definition,
  onSubmit,
  onSaveDraft,
  onDiscard,
  submitButtonText,
  saveDraftButtonText,
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

  const itemMap = useMemo(() => getItemMap(definition), [definition]);

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

  const handleSubmit = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.preventDefault();
      onSubmit(values);
    },
    [values, onSubmit]
  );

  const handleSaveDraft = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.preventDefault();
      if (!onSaveDraft) return;
      onSaveDraft(values);
    },
    [values, onSaveDraft]
  );

  const isEnabled = (item: FormItem): boolean => {
    if (item.hidden) return false;
    if (!item.enableWhen) {
      // If it has nested items, only show if has any enabled children.
      // Otherwise, show it.
      return item.item ? item.item.some((i) => isEnabled(i)) : true;
    }

    return shouldEnableItem(item, values, itemMap);
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

  const getCommonInputProps = useCallback(
    (item: FormItem) => {
      const inputProps: DynamicInputCommonProps = {
        disabled: item.readOnly || undefined,
      };

      (item.bounds || []).forEach((bound) => {
        const value = getBoundValue(bound, values);
        if (bound.type === BoundType.Min) {
          inputProps.min = value;
        } else if (bound.type === BoundType.Max) {
          inputProps.max = value;
        } else {
          console.warn('Unrecognized bound type', bound.type);
        }
      });
      return inputProps;
    },
    [values]
  );

  // Recursively render an item
  const renderItem = (item: FormItem, nestingLevel: number) => {
    if (!isEnabled(item)) {
      // console.log('Hidden:', item);
      return null;
    }

    return (
      <DynamicField
        key={item.linkId}
        item={item}
        itemChanged={itemChanged}
        value={values[item.linkId]}
        nestingLevel={nestingLevel}
        children={(item) => renderItem(item, nestingLevel + 1)}
        errors={getFieldErrors(item)}
        inputProps={getCommonInputProps(item)}
      />
    );
  };

  return (
    <Box component='form'>
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
        <Button
          variant='contained'
          type='submit'
          disabled={!!loading}
          onClick={handleSubmit}
        >
          {loading ? 'Saving...' : submitButtonText || 'Submit'}
        </Button>
        {onSaveDraft && (
          <Button
            variant='outlined'
            type='submit'
            disabled={!!loading}
            onClick={handleSaveDraft}
          >
            {loading
              ? 'Saving...'
              : saveDraftButtonText || 'Save and Finish Later'}
          </Button>
        )}
        <Button variant='gray' onClick={onDiscard || (() => navigate(-1))}>
          {discardButtonText || 'Discard'}
        </Button>
      </Stack>
    </Box>
  );
};

export default DynamicForm;
