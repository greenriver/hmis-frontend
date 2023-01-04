import { Alert, Box, Grid, Stack, Typography } from '@mui/material';
import { isNil, omit, pull } from 'lodash-es';
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';

import useElementInView from '../hooks/useElementInView';
import {
  addDescendants,
  autofillValues,
  buildAutofillDependencyMap,
  buildCommonInputProps,
  buildEnabledDependencyMap,
  CONFIRM_ERROR_TYPE,
  FormValues,
  getDisabledLinkIds,
  getItemMap,
  ItemMap,
  LinkIdMap,
  shouldEnableItem,
} from '../util/formUtil';
import { transformSubmitValues } from '../util/recordFormUtil';

import DynamicField from './DynamicField';
import DynamicGroup, { OverrideableDynamicFieldProps } from './DynamicGroup';
import FormActions, { FormActionProps } from './FormActions';
import SaveSlide from './SaveSlide';

import ConfirmationDialog from '@/components/elements/ConfirmDialog';
import {
  DisabledDisplay,
  FormDefinitionJson,
  FormItem,
  ItemType,
  ValidationError,
} from '@/types/gqlTypes';

export interface Props
  extends Omit<
    FormActionProps,
    'disabled' | 'loading' | 'onSubmit' | 'onSaveDraft'
  > {
  definition: FormDefinitionJson;
  onSubmit: (values: FormValues, confirmed?: boolean) => void;
  onSaveDraft?: (values: FormValues) => void;
  loading?: boolean;
  initialValues?: Record<string, any>;
  errors?: ValidationError[];
  warnings?: ValidationError[];
  showSavePrompt?: boolean;
  horizontal?: boolean;
  pickListRelationId?: string;
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
  errors = [],
  warnings = [],
  itemMap,
  autofillDependencyMap, // { linkId => array of Link IDs that depend on it for autofill }
  enabledDependencyMap, // { linkId => array of Link IDs that depend on it for enabled status }
  initiallyDisabledLinkIds, // list of link IDs that are disabled to start, based off definition and initialValues
  showSavePrompt = false,
  horizontal = false,
  pickListRelationId,
}) => {
  const navigate = useNavigate();

  const [promptSave, setPromptSave] = useState<boolean | undefined>();

  const [dialogDismissed, setDialogDismissed] = useState<boolean>(false);
  const saveButtonsRef = React.createRef<HTMLDivElement>();
  const isSaveButtonVisible = useElementInView(saveButtonsRef, '200px');

  useEffect(() => {
    if (isNil(promptSave)) return;
    setPromptSave(!isSaveButtonVisible);
  }, [isSaveButtonVisible, promptSave]);

  // Map { linkId => current value }
  const [values, setValues] = useState<FormValues>(
    Object.assign({}, initialValues)
  );

  // List of link IDs that are currently disabled
  const [disabledLinkIds, setDisabledLinkIds] = useState(
    initiallyDisabledLinkIds
  );

  if (errors.length > 0) console.log('Validation errors', errors);

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
        // console.debug('DynamicForm', newValues);
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
        // console.debug('DynamicForm', newValues);
        return newValues;
      });
    },
    [updateDisabledLinkIds]
  );

  const handleSubmit = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.preventDefault();
      setDialogDismissed(false);

      // Exclude all disabled items, and their descendants, from values hash
      const excluded = addDescendants(disabledLinkIds, definition);
      const valuesToSubmit = omit(values, excluded);

      // FOR DEBUGGING: if ctrl-click, just log values and don't submit anything
      if (
        import.meta.env.MODE !== 'production' &&
        (event.ctrlKey || event.metaKey)
      ) {
        console.log('%c CURRENT FORM STATE:', 'color: #BB7AFF');
        console.log(valuesToSubmit);
        const hudValues = transformSubmitValues({
          definition,
          values: valuesToSubmit,
        });
        window.debug = { hudValues };
        console.log(JSON.stringify(hudValues, null, 2));
      } else {
        onSubmit(valuesToSubmit);
      }
    },
    [values, onSubmit, disabledLinkIds, definition]
  );

  const handleConfirm = useCallback(
    () => onSubmit(values, true),
    [values, onSubmit]
  );

  const handleSaveDraft = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.preventDefault();
      if (!onSaveDraft) return;

      // Exclude all disabled items, and their descendants, from values hash
      const excluded = addDescendants(disabledLinkIds, definition);
      onSaveDraft(omit(values, excluded));
    },
    [values, onSaveDraft, definition, disabledLinkIds]
  );

  // Get errors for a particular field
  const getFieldErrors = useCallback(
    (item: FormItem) => {
      if (!errors) return undefined;
      if (!item.fieldName) return undefined;
      const attribute = item.fieldName;
      return errors.filter(
        (e) => e.attribute === attribute && e.type !== CONFIRM_ERROR_TYPE
      );
    },
    [errors]
  );

  // Recursively render an item
  const renderItem = (
    item: FormItem,
    nestingLevel: number,
    props?: OverrideableDynamicFieldProps,
    renderFn?: (children: ReactNode) => ReactNode
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
          renderChildItem={(item, props, fn) =>
            renderItem(item, nestingLevel + 1, props, fn)
          }
          values={values}
          itemChanged={itemChanged}
          severalItemsChanged={severalItemsChanged}
        />
      );
    }

    const itemComponent = (
      <DynamicField
        key={item.linkId}
        item={item}
        itemChanged={itemChanged}
        value={isDisabled ? undefined : values[item.linkId]}
        nestingLevel={nestingLevel}
        errors={getFieldErrors(item)}
        horizontal={horizontal}
        pickListRelationId={pickListRelationId}
        {...props}
        inputProps={{
          ...props?.inputProps,
          ...buildCommonInputProps(item, values),
          disabled: isDisabled || undefined,
        }}
      />
    );
    if (renderFn) {
      return renderFn(itemComponent);
    }
    return itemComponent;
  };

  const saveButtons = (
    <FormActions
      onSubmit={handleSubmit}
      onSaveDraft={onSaveDraft ? handleSaveDraft : undefined}
      onDiscard={onDiscard || (() => navigate(-1))}
      submitButtonText={submitButtonText}
      saveDraftButtonText={saveDraftButtonText}
      discardButtonText={discardButtonText}
      disabled={!!loading || (warnings.length > 0 && !dialogDismissed)}
      loading={loading}
    />
  );

  return (
    <Box
      component='form'
      onSubmit={(e: React.FormEvent<HTMLDivElement>) => e.preventDefault()}
    >
      <Grid container direction='column' spacing={2}>
        {errors.length > 0 && (
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

      {warnings.length > 0 && !dialogDismissed && (
        <ConfirmationDialog
          id='confirmSubmit'
          open
          title='Confirm Change'
          onConfirm={handleConfirm}
          onCancel={() => setDialogDismissed(true)}
          loading={loading || false}
        >
          <Stack>
            {warnings?.map((e) => (
              <Typography key={e.fullMessage}>{e.fullMessage}</Typography>
            ))}
          </Stack>
        </ConfirmationDialog>
      )}

      {showSavePrompt && (
        <SaveSlide
          in={promptSave && !isSaveButtonVisible}
          appear
          timeout={300}
          direction='up'
        >
          {saveButtons}
        </SaveSlide>
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
