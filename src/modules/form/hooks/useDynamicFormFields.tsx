import { omit } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';

import DynamicFormFields, {
  Props as DynamicFormFieldsProps,
} from '../components/DynamicFormFields';
import { FormValues } from '../types';
import { addDescendants, isShown } from '../util/formUtil';

import useComputedData from './useComputedData';

import { FormDefinitionJson, FormItem } from '@/types/gqlTypes';

const useDynamicFormFields = ({
  definition,
  initialValues,
  bulk,
}: {
  definition: FormDefinitionJson;
  initialValues?: Record<string, any>;
  bulk?: boolean;
}) => {
  const {
    itemMap,
    autofillDependencyMap,
    enabledDependencyMap,
    initiallyDisabledLinkIds = [],
  } = useComputedData({ definition, initialValues });

  const [disabledLinkIds, setDisabledLinkIds] = useState(
    initiallyDisabledLinkIds
  );
  const [values, setValues] = useState<FormValues>(
    Object.assign({}, initialValues)
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

  const renderFields = useCallback(
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
      >
    ) => (
      <DynamicFormFields
        {...props}
        {...{
          definition,
          itemMap,
          autofillDependencyMap,
          enabledDependencyMap,
          disabledLinkIds,
          setDisabledLinkIds,
          values,
          setValues,
          bulk,
        }}
      />
    ),
    [
      definition,
      itemMap,
      autofillDependencyMap,
      enabledDependencyMap,
      disabledLinkIds,
      values,
      bulk,
    ]
  );

  return useMemo(
    () => ({
      renderFields,
      values,
      getCleanedValues,
      shouldShowItem,
    }),
    [renderFields, values, getCleanedValues, shouldShowItem]
  );
};

export default useDynamicFormFields;
