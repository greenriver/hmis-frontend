import { cloneDeep } from '@apollo/client/utilities';
import { omit, without } from 'lodash-es';
import { ReactNode, useCallback, useMemo, useState } from 'react';
import { FieldValues, FormProvider, Path, useForm } from 'react-hook-form';
import { RecoilRoot } from 'recoil';
import useComputedData from '../../hooks/useComputedData';
import {
  ItemChangedFn,
  LocalConstants,
  SeveralItemsChangedFn,
} from '../../types';
import {
  addDescendants,
  autofillValues,
  dropUnderscorePrefixedKeys,
  getDependentItemsDisabledStatus,
  isShown,
} from '../../util/formUtil';
import DynamicFormFields, {
  Props as DynamicFormFieldsProps,
} from './RefactorFormFields';
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
  onSubmit: (values: FieldValues) => any;
  errors?: ValidationError[];
}

const useDynamicForm = <T extends FieldValues>({
  definition,
  initialValues = {} as T,
  onSubmit,
  localConstants = {},
  errors,
}: UseDynamicFormArgs<T>) => {
  const {
    itemMap,
    autofillDependencyMap,
    enabledDependencyMap,
    initiallyDisabledLinkIds = [],
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

  // const [disabledLinkIds, setDisabledLinkIds] = useState(
  //   initiallyDisabledLinkIds
  // );
  const [disabledLinkIds, setDisabledLinkIds] = useState(
    initiallyDisabledLinkIds
  );

  // Get form state, with "hidden" fields (and their children) removed
  const getCleanedValues = useCallback(() => {
    const values = methods.getValues();
    if (!definition) return values;

    // Retain disabled fields that are displayed with a value
    const hiddenLinkids = disabledLinkIds.filter(
      (id) => itemMap[id].disabledDisplay != DisabledDisplay.ProtectedWithValue
    );
    const excluded = addDescendants(hiddenLinkids, definition);
    // Drop "hidden" fields and their children
    const cleaned = omit(values, excluded);
    return dropUnderscorePrefixedKeys(cleaned);
  }, [definition, disabledLinkIds, itemMap, methods]);

  const shouldShowItem = useCallback(
    (item: FormItem) => isShown(item, disabledLinkIds),
    [disabledLinkIds]
  );

  // Updates localValues map in-place
  const updateAutofillValues = useCallback(
    (changedLinkIds: string[]) => {
      const values = { ...methods.getValues() };
      changedLinkIds.forEach((changedLinkId) => {
        if (!autofillDependencyMap[changedLinkId]) return;
        autofillDependencyMap[changedLinkId].forEach((dependentLinkId) => {
          autofillValues({
            item: itemMap[dependentLinkId],
            values: values,
            itemMap,
            localConstants: localConstants || {},
            viewOnly: false,
          });
          methods.setValue(dependentLinkId as Path<T>, values[dependentLinkId]);
        });
      });
    },
    [itemMap, autofillDependencyMap, localConstants, methods]
  );

  /**
   * Update the `disabledLinkIds` state.
   * This only evaluates the enableWhen conditions for items that are
   * dependent on the item that just changed ("changedLinkid").
   *
   * Also modifies localValues in-place to nullify disabled fields (when appropriate).
   */
  const updateDisabledValues = useCallback(
    (changedLinkIds: string[]) => {
      // Get enabled/disabled link ids, based on the ones that have changed
      const values = { ...methods.getValues() };
      const { enabledLinkIds, disabledLinkIds } =
        getDependentItemsDisabledStatus({
          changedLinkIds,
          localValues: values, // NOTE! This gets updated in-place
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
    [itemMap, enabledDependencyMap, localConstants, methods]
  );

  const itemChanged: ItemChangedFn = useCallback(
    (input) => {
      const { linkId, value } = input;
      methods.setValue(linkId as Path<T>, value);
      updateAutofillValues([linkId]);
      updateDisabledValues([linkId]);
    },
    [updateAutofillValues, updateDisabledValues, methods]
  );

  const severalItemsChanged: SeveralItemsChangedFn = useCallback(
    (input) => {
      Object.entries(input).forEach(([linkId, value]) =>
        itemChanged({ linkId, value, type: input.type })
      );
    },
    [itemChanged]
  );

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

  const renderFormContainer = useCallback(
    (children: ReactNode) => (
      <RecoilRoot>
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(() => onSubmit(getCleanedValues()))}
          >
            {children}
          </form>
        </FormProvider>
      </RecoilRoot>
    ),
    [methods, onSubmit, getCleanedValues]
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
            values: methods.watch(),
            bulk: false,
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
      itemChanged,
      severalItemsChanged,
      localConstants,
      methods,
    ]
  );

  return useMemo(
    () => ({
      methods,
      definition,
      onSubmit,
      renderFormContainer,
      shouldShowItem,
      itemChanged,
      severalItemsChanged,
      getFieldErrors,
      renderFormFields,
      getCleanedValues,
    }),
    [
      methods,
      definition,
      onSubmit,
      renderFormContainer,
      shouldShowItem,
      itemChanged,
      severalItemsChanged,
      getFieldErrors,
      renderFormFields,
      getCleanedValues,
    ]
  );
};

export default useDynamicForm;
