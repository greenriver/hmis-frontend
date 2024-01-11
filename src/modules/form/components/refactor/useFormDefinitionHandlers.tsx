import { cloneDeep } from '@apollo/client/utilities';
import { mapKeys, omit } from 'lodash-es';
import { useCallback, useMemo } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import useComputedData from '../../hooks/useComputedData';
import { LocalConstants } from '../../types';
import {
  addDescendants,
  autofillValues,
  dropUnderscorePrefixedKeys,
  getDependentItemsDisabledStatus,
  shouldEnableItem,
} from '../../util/formUtil';
import {
  DisabledDisplay,
  FormDefinitionJson,
  FormItem,
  ValidationError,
} from '@/types/gqlTypes';

export interface UseDynamicFormArgs<T extends FieldValues> {
  definition: FormDefinitionJson;
  initialValues?: T;
  localConstants?: LocalConstants;
  errors?: ValidationError[];
  onSubmit?: (values: FieldValues) => any;
}

export const getSafeLinkId = (linkId: string) =>
  String(linkId).replace(/\./g, ',');
export const getCleanedLinkId = (linkId: string) =>
  String(linkId).replace(/,/g, '.');

const useDynamicForm = <T extends FieldValues>({
  definition,
  initialValues = {} as T,
  localConstants = {},
  errors,
}: // onSubmit = () => {},
UseDynamicFormArgs<T>) => {
  const {
    itemMap,
    autofillDependencyMap,
    autofillInvertedDependencyMap,
    enabledDependencyMap,
    disabledDependencyMap,
  } = useComputedData({ definition, initialValues, localConstants });

  const methods = useForm<T>({
    values: (() => {
      const newValues = cloneDeep(initialValues);
      Object.keys(itemMap).forEach((linkId) => {
        autofillValues({
          item: itemMap[linkId],
          values: newValues,
          itemMap,
          localConstants: localConstants || {},
          viewOnly: false,
        });
      });
      return newValues;
    })(),
  });

  // Updates localValues map in-place
  const getAutofillValueForField = useCallback(
    (item: FormItem) => {
      const { linkId } = item;
      const values = mapKeys(methods.getValues(), (v, k) =>
        getCleanedLinkId(k)
      );
      if (!autofillInvertedDependencyMap[linkId]) return;
      autofillValues({
        item,
        values,
        itemMap,
        localConstants,
        viewOnly: item.readOnly, // TODO: Handle this
      });

      return values[linkId];
    },
    [itemMap, autofillInvertedDependencyMap, localConstants, methods]
  );

  // Get form state, with "hidden" fields (and their children) removed
  const getCleanedValues = useCallback(() => {
    const values = mapKeys(methods.getValues(), (val, key) =>
      getCleanedLinkId(key)
    );
    if (!definition) return values;

    const { disabledLinkIds } = getDependentItemsDisabledStatus({
      localValues: values, // NOTE! This gets updated in-place
      enabledDependencyMap,
      itemMap,
      localConstants: localConstants || {},
    });

    // Retain disabled fields that are displayed with a value
    const hiddenLinkids = disabledLinkIds.filter(
      (id) => itemMap[id].disabledDisplay !== DisabledDisplay.ProtectedWithValue
    );

    const excluded = addDescendants(hiddenLinkids, definition);
    // Drop "hidden" fields and their children
    const cleaned = omit(values, excluded);
    return dropUnderscorePrefixedKeys(cleaned);
  }, [methods, definition, enabledDependencyMap, itemMap, localConstants]);

  const getFieldErrors = useCallback(
    (item: FormItem) => {
      if (!errors || !item.mapping) return undefined;
      return errors.filter(
        (e) =>
          e.linkId === item.linkId ||
          (e.attribute && e.attribute === item.mapping?.fieldName)
      );
    },
    [errors]
  );

  const isItemDisabled = useCallback(
    (item: FormItem) =>
      !shouldEnableItem({
        item,
        itemMap,
        localConstants,
        values: getCleanedValues(),
      }),
    [itemMap, getCleanedValues, localConstants]
  );

  return useMemo(
    () => ({
      methods,
      definition,
      localConstants,
      itemMap,
      autofillDependencyMap,
      autofillInvertedDependencyMap,
      enabledDependencyMap,
      disabledDependencyMap,
      // renderFormContainer,
      getFieldErrors,
      // renderFormFields,
      getCleanedValues,
      isItemDisabled,
      getAutofillValueForField,
    }),
    [
      methods,
      definition,
      localConstants,
      itemMap,
      autofillDependencyMap,
      autofillInvertedDependencyMap,
      enabledDependencyMap,
      disabledDependencyMap,
      // renderFormContainer,
      getFieldErrors,
      // renderFormFields,
      getCleanedValues,
      isItemDisabled,
      getAutofillValueForField,
    ]
  );
};

export type FormDefinitionHandlers<T extends FieldValues = FieldValues> =
  ReturnType<typeof useDynamicForm<T>>;

export default useDynamicForm;
