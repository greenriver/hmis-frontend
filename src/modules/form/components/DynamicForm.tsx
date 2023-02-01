import { Alert, AlertTitle, Box, Grid } from '@mui/material';
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
  debugFormValues,
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
import ValidationErrorDisplay, {
  ValidationWarningDisplay,
} from './ValidationErrorDisplay';

import ConfirmationDialog from '@/components/elements/ConfirmDialog';
import { useValidations } from '@/modules/assessments/components/useValidations';
import {
  DisabledDisplay,
  FormDefinitionJson,
  FormItem,
  ItemType,
  ValidationError,
} from '@/types/gqlTypes';

export type DynamicFormOnSubmit = (
  rawValues: FormValues,
  hudValues: FormValues,
  confirmed?: boolean
) => void;

export interface Props
  extends Omit<
    FormActionProps,
    'disabled' | 'loading' | 'onSubmit' | 'onSaveDraft'
  > {
  definition: FormDefinitionJson;
  onSubmit: DynamicFormOnSubmit;
  onSaveDraft?: (values: FormValues) => void;
  loading?: boolean;
  initialValues?: Record<string, any>;
  errors?: ValidationError[];
  showSavePrompt?: boolean;
  horizontal?: boolean;
  pickListRelationId?: string;
  /** Whether to drop all disabled items from hudValues before calling onSubmit. We want this for Assessments but not record editing. */
  excludeDisabledItemsOnSubmit?: boolean;
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
  errors: validations,
  itemMap,
  autofillDependencyMap, // { linkId => array of Link IDs that depend on it for autofill }
  enabledDependencyMap, // { linkId => array of Link IDs that depend on it for enabled status }
  initiallyDisabledLinkIds, // list of link IDs that are disabled to start, based off definition and initialValues
  showSavePrompt = false,
  horizontal = false,
  excludeDisabledItemsOnSubmit = false,
  pickListRelationId,
}) => {
  const navigate = useNavigate();

  const [promptSave, setPromptSave] = useState<boolean | undefined>();
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

  const saveButtonsRef = React.createRef<HTMLDivElement>();
  const isSaveButtonVisible = useElementInView(saveButtonsRef, '200px');

  useEffect(() => {
    if (isNil(promptSave)) return;
    setPromptSave(!isSaveButtonVisible);
  }, [isSaveButtonVisible, promptSave]);

  const { errors, warnings } = useValidations(validations);

  useEffect(() => {
    if (warnings.length && !errors.length) {
      setShowConfirmDialog(true);
    }
  }, [errors, warnings]);

  // Map { linkId => current value }
  const [values, setValues] = useState<FormValues>(
    Object.assign({}, initialValues)
  );

  // List of link IDs that are currently disabled
  const [disabledLinkIds, setDisabledLinkIds] = useState(
    initiallyDisabledLinkIds
  );

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
        // Updates dependent autofill questions (modifies newValues in-place)
        updateAutofillValues([linkId], newValues);
        // Update list of disabled linkIds based on new values
        updateDisabledLinkIds([linkId], newValues);
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
        // Updates dependent autofill questions (modifies newValues in-place)
        updateAutofillValues(Object.keys(values), newValues);
        // Update list of disabled linkIds based on new values
        updateDisabledLinkIds(Object.keys(values), newValues);
        // console.debug('DynamicForm', newValues);
        return newValues;
      });
    },
    [updateDisabledLinkIds, updateAutofillValues]
  );

  const getValuesToSubmit = useCallback(() => {
    // Exclude all disabled items and their descendants from values
    const excluded = addDescendants(disabledLinkIds, definition);
    const valuesToSubmit = omit(values, excluded);
    const hudValues = transformSubmitValues({
      definition,
      values: valuesToSubmit,
      autofillNotCollected: true,
      autofillNulls: true,
      excludeLinkIds: excludeDisabledItemsOnSubmit ? excluded : [],
    });
    return [valuesToSubmit, hudValues];
  }, [values, disabledLinkIds, definition, excludeDisabledItemsOnSubmit]);

  const handleSubmit = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.preventDefault();
      // setDialogDismissed(false);
      const [valuesToSubmit, hudValues] = getValuesToSubmit();
      // FOR DEBUGGING: if ctrl-click, just log values and don't submit anything
      if (
        import.meta.env.MODE !== 'production' &&
        (event.ctrlKey || event.metaKey)
      ) {
        debugFormValues(valuesToSubmit, hudValues);
      } else {
        onSubmit(valuesToSubmit, hudValues, false);
      }
    },
    [onSubmit, getValuesToSubmit]
  );

  const handleConfirm = useCallback(() => {
    const [valuesToSubmit, hudValues] = getValuesToSubmit();
    onSubmit(valuesToSubmit, hudValues, true);
  }, [onSubmit, getValuesToSubmit]);

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
      if (!errors || !item.fieldName) return undefined;
      // TODO: add link id to error response instead?
      return errors.filter((e) => e.attribute === item.fieldName);
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
      disabled={!!loading || showConfirmDialog}
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
            <Alert severity='error' sx={{ mb: 1 }} data-testid='formErrorAlert'>
              <AlertTitle>Please fix outstanding errors</AlertTitle>
              <ValidationErrorDisplay errors={errors} />
            </Alert>
          </Grid>
        )}
        {definition.item.map((item) => renderItem(item, 0))}
      </Grid>
      <Box ref={saveButtonsRef} sx={{ mt: 3 }}>
        {saveButtons}
      </Box>

      {showConfirmDialog && (
        <ConfirmationDialog
          id='confirmSubmit'
          open
          title='Ignore Warnings?'
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirmDialog(false)}
          loading={loading || false}
          confirmText='Submit Assessment'
          sx={{
            '.MuiDialog-paper': {
              minWidth: '400px',
              // backgroundColor: (theme) =>
              //   lighten(theme.palette.warning.light, 0.85),
            },
            '.MuiDialogTitle-root': {
              textTransform: 'unset',
              color: 'text.primary',
              fontSize: 18,
              fontWeight: 800,
            },
          }}
        >
          {warnings.length && <ValidationWarningDisplay warnings={warnings} />}
        </ConfirmationDialog>
      )}

      {showSavePrompt && !isSaveButtonVisible && (
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
    const disabled = getDisabledLinkIds(items, initialValues || {});
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
