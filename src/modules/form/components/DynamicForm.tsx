import { Alert, Box, Button, Grid, Paper, Slide, Stack } from '@mui/material';
import { isNil } from 'lodash-es';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import useElementInView from '../hooks/useElementInView';
import {
  getItemMap,
  shouldEnableItem,
  buildCommonInputProps,
  autofillValues,
} from '../util/formUtil';

import DynamicField from './DynamicField';
import DynamicGroup, { OverrideableDynamicFieldProps } from './DynamicGroup';

import {
  DisabledDisplay,
  FormDefinitionJson,
  FormItem,
  ItemType,
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
  showSavePrompt?: boolean;
  horizontal?: boolean;
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
  showSavePrompt = false,
  horizontal = false,
}) => {
  const navigate = useNavigate();

  const [promptSave, setPromptSave] = useState<boolean | undefined>();
  const saveButtonsRef = React.createRef<HTMLDivElement>();
  const isSaveButtonVisible = useElementInView(saveButtonsRef, '0px');

  useEffect(() => {
    if (isNil(promptSave)) return;
    setPromptSave(!isSaveButtonVisible);
  }, [isSaveButtonVisible, promptSave]);

  // Map { linkId => current value }
  const [values, setValues] = useState<Record<string, any>>(
    Object.assign({}, initialValues)
  );

  // console.log(values);

  const itemMap = useMemo(() => getItemMap(definition), [definition]);

  /**
   * Map { linkId => array of Link IDs that depend on it for autofill }
   */
  const autofillDependencyMap = useMemo(() => {
    const deps: Record<string, string[]> = {};
    Object.values(itemMap).forEach((item) => {
      if (!item.autofillValues) return;

      item.autofillValues.forEach((v) => {
        (v.autofillWhen || []).forEach((w) => {
          if (deps[w.question]) {
            deps[w.question].push(item.linkId);
          } else {
            deps[w.question] = [item.linkId];
          }
        });
      });
    });
    return deps;
  }, [itemMap]);

  // Updates localValues map in-place
  const updateAutofillValues = useCallback(
    (changedLinkId: string, localValues: any) => {
      if (!autofillDependencyMap[changedLinkId]) return;
      autofillDependencyMap[changedLinkId].forEach((dependentLinkId) => {
        autofillValues(itemMap[dependentLinkId], localValues, itemMap);
      });
    },
    [itemMap, autofillDependencyMap]
  );

  if (errors) console.log('Validation errors', errors);

  const itemChanged = useCallback(
    (linkId: string, value: any) => {
      setPromptSave(true);
      setValues((currentValues) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        currentValues[linkId] = value;
        updateAutofillValues(linkId, currentValues);
        return { ...currentValues };
      });
    },
    [setValues, updateAutofillValues]
  );

  const severalItemsChanged = useCallback(
    (values: Record<string, any>) => {
      setPromptSave(true);
      setValues((currentValues) => {
        return { ...currentValues, ...values };
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
      if (!item.fieldName) return undefined;
      const attribute = item.fieldName;
      return errors.filter((e) => e.attribute === attribute);
    },
    [errors]
  );

  // Recursively render an item
  const renderItem = (
    item: FormItem,
    nestingLevel: number,
    props?: OverrideableDynamicFieldProps
  ) => {
    const isDisabled = !isEnabled(item);
    if (isDisabled && item.disabledDisplay !== DisabledDisplay.Protected) {
      return null;
    }

    if (item.type === ItemType.Group) {
      return (
        <DynamicGroup
          item={item}
          key={item.linkId}
          nestingLevel={nestingLevel}
          renderChildItem={(item, props) =>
            renderItem(item, nestingLevel + 1, props)
          }
          values={values}
          itemChanged={itemChanged}
          severalItemsChanged={severalItemsChanged}
        />
      );
    }
    return (
      <DynamicField
        key={item.linkId}
        item={item}
        itemChanged={itemChanged}
        value={values[item.linkId]}
        nestingLevel={nestingLevel}
        errors={getFieldErrors(item)}
        inputProps={{
          ...buildCommonInputProps(item, values),
          disabled: isDisabled || undefined,
        }}
        horizontal={horizontal}
        {...props}
      />
    );
  };

  const saveButtons = (
    <Stack direction='row' spacing={1}>
      <Button variant='gray' onClick={onDiscard || (() => navigate(-1))}>
        {discardButtonText || 'Discard'}
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
      <Button
        variant='contained'
        type='submit'
        disabled={!!loading}
        onClick={handleSubmit}
      >
        {loading ? 'Saving...' : submitButtonText || 'Submit'}
      </Button>
    </Stack>
  );

  return (
    <Box
      component='form'
      onSubmit={(e: React.FormEvent<HTMLDivElement>) => e.preventDefault()}
    >
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
      <Box ref={saveButtonsRef} sx={{ mt: 3 }}>
        {saveButtons}
      </Box>

      {showSavePrompt && (
        <Slide in={promptSave} appear timeout={300} direction='up'>
          <Paper
            elevation={2}
            square
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'row-reverse',
              opacity: 0.9,
              py: 2,
              px: 8,
            }}
          >
            <Stack direction='row' spacing={3} alignItems='center'>
              {/* <Typography>There are unsaved changes.</Typography> */}
              {saveButtons}
            </Stack>
          </Paper>
        </Slide>
      )}
    </Box>
  );
};

export default DynamicForm;
