import { cloneDeep } from '@apollo/client/utilities';
import { mapKeys, omit } from 'lodash-es';
import { useCallback, useMemo } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import useComputedData from '../hooks/useComputedData';
import { LocalConstants } from '../types';
import {
  addDescendants,
  autofillValues,
  dropUnderscorePrefixedKeys,
  getInitialValues,
  shouldEnableItem,
} from '../util/formUtil';
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
}

export const getSafeLinkId = (linkId: string) =>
  String(linkId).replace(/\./g, '__');
export const getCleanedLinkId = (linkId: string) =>
  String(linkId).replace(/__/g, '.');

export const mapKeysToSafe = (values: FieldValues) =>
  mapKeys(values, (val, key) => getSafeLinkId(key));
export const mapKeysToClean = (values: FieldValues) =>
  mapKeys(values, (val, key) => getCleanedLinkId(key));

const useDynamicForm = <T extends FieldValues>({
  definition,
  initialValues = {} as T,
  localConstants = {},
  errors,
}: UseDynamicFormArgs<T>) => {
  const {
    itemMap,
    autofillDependencyMap,
    autofillInvertedDependencyMap,
    enabledDependencyMap,
    disabledDependencyMap,
  } = useComputedData({ definition, initialValues, localConstants });

  const methods = useForm<T>({
    values: (() => {
      const newValues = {
        ...getInitialValues(definition, localConstants),
        ...cloneDeep(initialValues),
      };
      Object.keys(itemMap).forEach((linkId) => {
        autofillValues({
          item: itemMap[linkId],
          values: newValues,
          itemMap,
          localConstants: localConstants || {},
          viewOnly: false,
        });
      });
      return mapKeysToSafe(newValues) as T;
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
      const shouldAutofill = autofillValues({
        item,
        values,
        itemMap,
        localConstants,
        viewOnly: item.readOnly, // TODO: Handle this
      });

      if (!shouldAutofill) return undefined;

      const result = values[linkId];

      return result;
    },
    [itemMap, autofillInvertedDependencyMap, localConstants, methods]
  );

  // Get form state, with "hidden" fields (and their children) removed
  const getCleanedValues = useCallback(() => {
    const values = mapKeysToClean(methods.getValues());
    if (!definition) return values;

    const excluded = addDescendants(
      Object.entries(itemMap)
        .filter(([, item]) => {
          const shouldDisable = !shouldEnableItem({
            item,
            itemMap,
            localConstants,
            values,
          });
          if (shouldDisable)
            return item.disabledDisplay !== DisabledDisplay.ProtectedWithValue;
          return false;
        })
        .map(([linkId]) => linkId),
      definition
    );

    // Drop "hidden" fields and their children
    const cleaned = omit(values, excluded);
    return dropUnderscorePrefixedKeys(cleaned);
  }, [methods, definition, itemMap, localConstants]);

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
    (item: FormItem) => {
      return !shouldEnableItem({
        item,
        itemMap,
        localConstants,
        values: getCleanedValues(),
      });
    },
    [itemMap, localConstants, getCleanedValues]
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
