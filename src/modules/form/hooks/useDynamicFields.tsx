import { cloneDeep, omit, without } from 'lodash-es';
import { useCallback, useEffect, useMemo, useState } from 'react';

import DynamicFormFields, {
  Props as DynamicFormFieldsProps,
} from '../components/DynamicFormFields';
import DynamicViewFields from '../components/viewable/DynamicViewFields';
import {
  ChangeType,
  FormValues,
  ItemChangedFn,
  LocalConstants,
  SeveralItemsChangedFn,
} from '../types';
import {
  addDescendants,
  autofillValues,
  dropUnderscorePrefixedKeys,
  getDependentItemsDisabledStatus,
  isShown,
} from '../util/formUtil';

import useComputedData from './useComputedData';

import { FormDefinitionJson, FormItem } from '@/types/gqlTypes';

const useDynamicFields = ({
  definition,
  initialValues,
  bulk = false,
  viewOnly = false,
  localConstants,
  onFieldChange,
}: {
  definition: FormDefinitionJson;
  initialValues?: Record<string, any>;
  bulk?: boolean;
  viewOnly?: boolean;
  localConstants?: LocalConstants;
  onFieldChange?: (type: ChangeType) => void;
}) => {
  const [values, setValues] = useState<FormValues>(
    Object.assign({}, initialValues)
  );

  const {
    itemMap,
    autofillDependencyMap,
    enabledDependencyMap,
    initiallyDisabledLinkIds = [],
  } = useComputedData({ definition, initialValues, viewOnly, localConstants });

  const [disabledLinkIds, setDisabledLinkIds] = useState(
    initiallyDisabledLinkIds
  );

  // Get form state, with "hidden" fields (and their children) removed
  const getCleanedValues = useCallback(() => {
    if (!definition) return values;
    const excluded = addDescendants(disabledLinkIds, definition);
    // Drop "hidden" fields and their children
    const cleaned = omit(values, excluded);
    return dropUnderscorePrefixedKeys(cleaned);
  }, [definition, disabledLinkIds, values]);

  const shouldShowItem = useCallback(
    (item: FormItem) => isShown(item, disabledLinkIds),
    [disabledLinkIds]
  );

  // Updates localValues map in-place
  const updateAutofillValues = useCallback(
    (changedLinkIds: string[], localValues: any) => {
      changedLinkIds.forEach((changedLinkId) => {
        if (!autofillDependencyMap[changedLinkId]) return;
        autofillDependencyMap[changedLinkId].forEach((dependentLinkId) => {
          autofillValues({
            item: itemMap[dependentLinkId],
            values: localValues,
            itemMap,
            localConstants: localConstants || {},
          });
        });
      });
    },
    [itemMap, autofillDependencyMap, localConstants]
  );

  /**
   * Update the `disabledLinkIds` state.
   * This only evaluates the enableWhen conditions for items that are
   * dependent on the item that just changed ("changedLinkid").
   *
   * Also modifies localValues in-place to nullify disabled fields (when appropriate).
   */
  const updateDisabledValues = useCallback(
    (changedLinkIds: string[], localValues: FormValues) => {
      // Get enabled/disabled link ids, based on the ones that have changed
      const { enabledLinkIds, disabledLinkIds } =
        getDependentItemsDisabledStatus({
          changedLinkIds,
          localValues, // NOTE! This gets updated in-place
          enabledDependencyMap,
          itemMap,
          localConstants: localConstants || {},
        });

      // Update state
      setDisabledLinkIds((old) => {
        const newList = without(old, ...enabledLinkIds);
        newList.push(...disabledLinkIds);
        return newList;
      });
    },
    [itemMap, enabledDependencyMap, localConstants]
  );

  // Run autofill once for all values on initial load
  useEffect(() => {
    setValues((old) => {
      const newValues = cloneDeep(old);
      Object.keys(itemMap).forEach((linkId) => {
        autofillValues({
          item: itemMap[linkId],
          values: newValues,
          itemMap,
          localConstants: localConstants || {},
        });
      });
      return newValues;
    });
  }, [itemMap, localConstants]);

  const itemChanged: ItemChangedFn = useCallback(
    (input) => {
      if (onFieldChange) onFieldChange(input.type);
      const { linkId, value } = input;
      setValues((currentValues) => {
        const newValues = { ...currentValues };
        newValues[linkId] = value;
        // Update dependent autofill questions (modifies newValues in-place)
        updateAutofillValues([linkId], newValues);
        // Update list of disabled linkIds based on new values.
        // Also modifies newValues in-place to nullify some disabled values.
        updateDisabledValues([linkId], newValues);
        return newValues;
      });
    },
    [updateAutofillValues, updateDisabledValues, setValues, onFieldChange]
  );

  const severalItemsChanged: SeveralItemsChangedFn = useCallback(
    (input) => {
      if (onFieldChange) onFieldChange(input.type);
      setValues((currentValues) => {
        const newValues = { ...currentValues, ...input.values };
        // Update dependent autofill questions (modifies newValues in-place)
        updateAutofillValues(Object.keys(input.values), newValues);
        // Update list of disabled linkIds based on new values.
        // Also modifies newValues in-place to nullify some disabled values.
        updateDisabledValues(Object.keys(input.values), newValues);
        return newValues;
      });
    },
    [onFieldChange, updateAutofillValues, updateDisabledValues]
  );

  const renderFormFields = useCallback(
    (
      props: Omit<
        DynamicFormFieldsProps,
        | 'definition'
        | 'itemMap'
        | 'autofillDependencyMap'
        | 'enabledDependencyMap'
        | 'disabledLinkIds'
        | 'setDisabledLinkIds'
        | 'values'
        | 'setValues'
        | 'bulk'
        | 'itemChanged'
        | 'severalItemsChanged'
        | 'localConstants'
      > & {
        itemChanged?: ItemChangedFn;
        severalItemsChanged?: SeveralItemsChangedFn;
      }
    ) => {
      return (
        <DynamicFormFields
          {...props}
          {...{
            definition,
            itemMap,
            disabledLinkIds,
            values,
            bulk,
            itemChanged,
            severalItemsChanged,
            localConstants,
          }}
        />
      );
    },
    [
      definition,
      itemMap,
      disabledLinkIds,
      values,
      bulk,
      itemChanged,
      severalItemsChanged,
      localConstants,
    ]
  );

  const renderViewFields = useCallback(
    (
      props: Omit<
        DynamicFormFieldsProps,
        | 'definition'
        | 'itemMap'
        | 'autofillDependencyMap'
        | 'enabledDependencyMap'
        | 'disabledLinkIds'
        | 'setDisabledLinkIds'
        | 'values'
        | 'setValues'
        | 'bulk'
        | 'itemChanged'
        | 'severalItemsChanged'
        | 'localConstants'
      > & {
        itemChanged?: ItemChangedFn;
      }
    ) => (
      <DynamicViewFields
        {...props}
        {...{
          definition,
          itemMap,
          disabledLinkIds,
          values,
          bulk,
          itemChanged: itemChanged,
        }}
      />
    ),
    [definition, itemMap, disabledLinkIds, values, bulk, itemChanged]
  );

  return useMemo(
    () => ({
      renderFields: viewOnly ? renderViewFields : renderFormFields,
      values,
      getCleanedValues,
      shouldShowItem,
    }),
    [
      values,
      viewOnly,
      renderFormFields,
      renderViewFields,
      getCleanedValues,
      shouldShowItem,
    ]
  );
};

export default useDynamicFields;
