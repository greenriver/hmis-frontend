import { cloneDeep } from '@apollo/client/utilities';
import { omit } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';
import { DefaultValues, FieldValues, useForm } from 'react-hook-form';

import { LocalConstants } from '../types';
import {
  addDescendants,
  autofillValues,
  createHudValuesForSubmit,
  createValuesForSubmit,
  dropUnderscorePrefixedKeys,
  getInitialValues,
  shouldEnableItem,
} from '../util/formUtil';
import useComputedData from './useComputedData';
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
  viewOnly?: boolean;
}

const useFormDefinitionHandlers = <T extends FieldValues>({
  definition,
  initialValues = {} as T,
  localConstants = {},
  errors,
  viewOnly = false,
}: UseDynamicFormArgs<T>) => {
  const {
    itemMap,
    autofillDependencyMap,
    autofillInvertedDependencyMap,
    boundsInvertedDependencyMap,
    enabledDependencyMap,
    disabledDependencyMap,
  } = useComputedData({ definition, viewOnly });

  const [defaultValues] = useState(() => {
    const newValues: Record<string, any> = {
      ...getInitialValues(definition, localConstants),
      ...cloneDeep(initialValues),
    };
    Object.keys(itemMap).forEach((linkId) => {
      const change = autofillValues({
        item: itemMap[linkId],
        values: newValues,
        itemMap,
        localConstants: localConstants || {},
        viewOnly,
      });
      //console.info('form init autofill', linkId, change)
      if (change) newValues[linkId] = change.value;
    });
    const result = newValues as DefaultValues<T>;
    return result;
  });

  const methods = useForm<T>({ defaultValues });

  // Transforms form state by removing fields that are disabled and not visible.
  // Most hidden disabled fields should already be removed from the form state by DependentFormItemWrapper,
  // but this method ensures that all children of hidden items are removed as well.
  const getRawValuesForSubmit = useCallback(() => {
    const values = methods.getValues();
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
    // Drop any keys that are prefixed with an underscore, which is a convention for attributes
    // that should not be submitted to the backend (introduced in PR #281 for keys on multi-Name and multi-Address inputs)
    return dropUnderscorePrefixedKeys(cleaned);
  }, [methods, definition, itemMap, localConstants]);

  const getValuesForSubmit = useCallback(() => {
    const vals = getRawValuesForSubmit();
    return {
      // Example: { 'favorite_color': { code: 'light_blue', label: 'Light Blue' }, 'assessment_date': <JS Date Object> }
      rawValues: vals,
      // Example: { 'favorite_color': 'light_blue', 'assessment_date': '2020-09-01' }
      // Stored as "values" in FormProcessor, for dynamic form submission
      valuesByLinkId: createValuesForSubmit(vals, definition),
      // Example: { 'Client.favorite_color_field_key': 'light_blue', 'assessmentDate': '2020-09-01', 'someOtherHiddenField': '_HIDDEN' }
      // Stored as "hud_values" in FormProcessor, for dynamic form submission
      valuesByFieldName: createHudValuesForSubmit(vals, definition),
    };
  }, [definition, getRawValuesForSubmit]);

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

  const resetDirty = useCallback(() => {
    methods.reset(undefined, { keepValues: true });
  }, [methods]);

  return useMemo(
    () => ({
      methods,
      definition,
      localConstants,
      itemMap,
      autofillDependencyMap,
      autofillInvertedDependencyMap,
      boundsInvertedDependencyMap,
      enabledDependencyMap,
      disabledDependencyMap,
      getFieldErrors,
      getValuesForSubmit,
      resetDirty,
      viewOnly,
    }),
    [
      methods,
      definition,
      localConstants,
      itemMap,
      autofillDependencyMap,
      autofillInvertedDependencyMap,
      boundsInvertedDependencyMap,
      enabledDependencyMap,
      disabledDependencyMap,
      getFieldErrors,
      getValuesForSubmit,
      resetDirty,
      viewOnly,
    ]
  );
};

export type FormDefinitionHandlers<T extends FieldValues = FieldValues> =
  ReturnType<typeof useFormDefinitionHandlers<T>>;

export default useFormDefinitionHandlers;
