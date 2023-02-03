import { omit } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';

import DynamicFormFields, {
  Props as DynamicFormFieldsProps,
} from '../components/DynamicFormFields';
import { addDescendants, FormValues } from '../util/formUtil';

import useComputedData from './useComputedData';

import { FormDefinitionJson } from '@/types/gqlTypes';

const useDynamicFormFields = ({
  definition,
  initialValues,
}: {
  definition: FormDefinitionJson;
  initialValues?: Record<string, any>;
}) => {
  const {
    items: itemMap,
    autofillMap: autofillDependencyMap,
    enabledMap: enabledDependencyMap,
    disabled: initiallyDisabledLinkIds = [],
  } = useComputedData({ definition, initialValues });

  const [disabledLinkIds, setDisabledLinkIds] = useState(
    initiallyDisabledLinkIds
  );
  const [values, setValues] = useState<FormValues>(
    Object.assign({}, initialValues)
  );

  const getCleanedValues = useCallback(() => {
    if (!definition) return values;
    const excluded = addDescendants(disabledLinkIds, definition);
    return omit(values, excluded);
  }, [definition, disabledLinkIds, values]);

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
    ]
  );

  return useMemo(
    () => ({
      renderFields,
      values,
      getCleanedValues,
    }),
    [renderFields, values, getCleanedValues]
  );
};

export default useDynamicFormFields;
