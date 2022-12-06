import { Alert, Box, Button, Grid, Paper, Slide, Stack } from '@mui/material';
import { isNil, pull } from 'lodash-es';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import useElementInView from '../hooks/useElementInView';
import {
  autofillValues,
  buildAutofillDependencyMap,
  buildCommonInputProps,
  buildEnabledDependencyMap,
  getDisabledLinkIds,
  getItemMap,
  ItemMap,
  LinkIdMap,
  shouldEnableItem,
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

const DynamicForm: React.FC<
  Props & {
    itemMap: ItemMap;
    autofillDependencyMap: LinkIdMap;
    enabledDependencyMap: LinkIdMap;
    initiallyDisabledLinkIds: string[];
  }
> = ({
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
  itemMap,
  autofillDependencyMap, // { linkId => array of Link IDs that depend on it for autofill }
  enabledDependencyMap, // { linkId => array of Link IDs that depend on it for enabled status }
  initiallyDisabledLinkIds, // list of link IDs that are disabled to start, based off definition and initialValues
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

  // List of link IDs that are currently disabled
  const [disabledLinkIds, setDisabledLinkIds] = useState(
    initiallyDisabledLinkIds
  );

  if (errors) console.log('Validation errors', errors);

  // Updates localValues map in-place
  const updateAutofillValues = useCallback(
    (changedLinkIds: string[], localValues: any) => {
      changedLinkIds.forEach((changedLinkId) => {
        if (!autofillDependencyMap[changedLinkId]) return;
        autofillDependencyMap[changedLinkId].forEach((dependentLinkId) => {
          autofillValues(itemMap[dependentLinkId], localValues, itemMap);
        });
      });
    },
    [itemMap, autofillDependencyMap]
  );

  /**
   * Update the `disabledLinkIds` state.
   * This only evaluates the enableWhen conditions for items that are
   * dependent on the item that just changed ("changedLinkid").
   */
  const updateDisabledLinkIds = useCallback(
    (changedLinkIds: string[], localValues: any) => {
      // If none of these are dependencies, return immediately
      if (!changedLinkIds.find((id) => !!enabledDependencyMap[id])) return;

      setDisabledLinkIds((oldList) => {
        const newList = [...oldList];
        changedLinkIds.forEach((changedLinkId) => {
          if (!enabledDependencyMap[changedLinkId]) return;

          enabledDependencyMap[changedLinkId].forEach((dependentLinkId) => {
            const enabled = shouldEnableItem(
              itemMap[dependentLinkId],
              localValues,
              itemMap
            );
            if (enabled && newList.includes(dependentLinkId)) {
              pull(newList, dependentLinkId);
            } else if (!enabled && !newList.includes(dependentLinkId)) {
              newList.push(dependentLinkId);
            }
          });
        });

        return newList;
      });
    },
    [itemMap, enabledDependencyMap]
  );

  const isEnabled = useCallback(
    (item: FormItem): boolean => {
      if (item.hidden) return false;
      if (!item.enableWhen && item.item) {
        // This is a group. Only show it if some children are enabled.
        return item.item.some((i) => isEnabled(i));
      }

      return !disabledLinkIds.includes(item.linkId);
    },
    [disabledLinkIds]
  );

  const itemChanged = useCallback(
    (linkId: string, value: any) => {
      setPromptSave(true);
      setValues((currentValues) => {
        const newValues = { ...currentValues };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        newValues[linkId] = value;
        updateAutofillValues([linkId], newValues); // updates newValues in-place
        updateDisabledLinkIds([linkId], newValues); // calls setState for disabled link IDs

        // TODO (maybe) clear values of disabled items if disabledDisplay is protected
        console.debug('DynamicForm', newValues);
        return newValues;
      });
    },
    [updateAutofillValues, updateDisabledLinkIds]
  );

  const severalItemsChanged = useCallback(
    (values: Record<string, any>) => {
      setPromptSave(true);
      setValues((currentValues) => {
        const newValues = { ...currentValues, ...values };
        // Update which link IDs are disabled or not, based on the Link IDs that have changed
        updateDisabledLinkIds(Object.keys(values), newValues);
        console.debug('DynamicForm', newValues);
        return newValues;
      });
    },
    [updateDisabledLinkIds]
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

/**
 * Wrapper component to do some pre computation on form definition
 */
const DynamicFormWithComputedData = ({
  definition,
  initialValues,
  ...props
}: Props) => {
  const [
    itemMap,
    autofillDependencyMap,
    enabledDependencyMap,
    initiallyDisabledLinkIds,
  ] = useMemo(() => {
    const items = getItemMap(definition);
    const autofillMap = buildAutofillDependencyMap(items);
    const enabledMap = buildEnabledDependencyMap(items);
    const disabled = getDisabledLinkIds(items, initialValues);
    return [items, autofillMap, enabledMap, disabled];
  }, [definition, initialValues]);

  return (
    <DynamicForm
      initialValues={initialValues}
      definition={definition}
      itemMap={itemMap}
      autofillDependencyMap={autofillDependencyMap}
      enabledDependencyMap={enabledDependencyMap}
      initiallyDisabledLinkIds={initiallyDisabledLinkIds}
      {...props}
    />
  );
};

export default DynamicFormWithComputedData;
