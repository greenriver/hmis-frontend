import { omit } from 'lodash-es';
import { useCallback, useEffect, useMemo, useState } from 'react';

import DynamicFormFields, {
  Props as DynamicFormFieldsProps,
} from '../components/DynamicFormFields';
import DynamicViewFields from '../components/viewable/DynamicViewFields';
import { FormValues, ItemChangedFn, SeveralItemsChangedFn } from '../types';
import {
  addDescendants,
  autofillValues,
  isShown,
  setDisabledLinkIdsBase,
} from '../util/formUtil';

import useComputedData from './useComputedData';

import { FormDefinitionJson, FormItem } from '@/types/gqlTypes';

const useDynamicFields = ({
  definition,
  initialValues,
  bulk = false,
  viewOnly = false,
}: {
  definition: FormDefinitionJson;
  initialValues?: Record<string, any>;
  bulk?: boolean;
  viewOnly?: boolean;
}) => {
  const [values, setValues] = useState<FormValues>(
    Object.assign({}, initialValues)
  );

  const {
    itemMap,
    autofillDependencyMap,
    enabledDependencyMap,
    initiallyDisabledLinkIds = [],
  } = useComputedData({ definition, initialValues, viewOnly });

  const [disabledLinkIds, setDisabledLinkIds] = useState(
    initiallyDisabledLinkIds
  );

  // Get form state, with "hidden" fields (and their children) removed
  const getCleanedValues = useCallback(() => {
    if (!definition) return values;
    const excluded = addDescendants(disabledLinkIds, definition);
    return omit(values, excluded);
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
      setDisabledLinkIdsBase(changedLinkIds, localValues, setDisabledLinkIds, {
        enabledDependencyMap,
        itemMap,
      });
    },
    [itemMap, enabledDependencyMap, setDisabledLinkIds]
  );

  // Run autofill once for all values on initial load
  useEffect(() => {
    updateAutofillValues(Object.keys(values), values);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wrappedItemChanged: (wrappedFn?: ItemChangedFn) => ItemChangedFn =
    useCallback(
      (wrappedFn) => (input) => {
        if (wrappedFn) wrappedFn(input);
        const { linkId, value } = input;
        setValues((currentValues) => {
          const newValues = { ...currentValues };
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          newValues[linkId] = value;
          // Updates dependent autofill questions (modifies newValues in-place)
          updateAutofillValues([linkId], newValues);
          // Update list of disabled linkIds based on new values
          updateDisabledLinkIds([linkId], newValues);

          return newValues;
        });
      },
      [updateAutofillValues, updateDisabledLinkIds, setValues]
    );

  const wrappedSeveralItemsChanged: (
    wrappedFn?: SeveralItemsChangedFn
  ) => SeveralItemsChangedFn = useCallback(
    (wrappedFn) => (input) => {
      if (wrappedFn) wrappedFn(input);
      setValues((currentValues) => {
        const newValues = { ...currentValues, ...input.values };
        // Updates dependent autofill questions (modifies newValues in-place)
        updateAutofillValues(Object.keys(input.values), newValues);
        // Update list of disabled linkIds based on new values
        updateDisabledLinkIds(Object.keys(input.values), newValues);
        // console.debug('DynamicForm', newValues);
        return newValues;
      });
    },
    [updateDisabledLinkIds, updateAutofillValues, setValues]
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
            itemChanged: wrappedItemChanged(props.itemChanged),
            severalItemsChanged: wrappedSeveralItemsChanged(
              props.severalItemsChanged
            ),
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
      wrappedItemChanged,
      wrappedSeveralItemsChanged,
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
          itemChanged: wrappedItemChanged(props.itemChanged),
        }}
      />
    ),
    [definition, itemMap, disabledLinkIds, values, bulk, wrappedItemChanged]
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
