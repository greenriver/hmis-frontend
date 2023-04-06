import { omit } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';

import DynamicViewFields, {
  isShown,
  Props as DynamicViewFieldsProps,
} from '../components/viewable/DynamicViewFields';
import { addDescendants } from '../util/formUtil';

import useComputedData from './useComputedData';

import { FormDefinitionJson, FormItem } from '@/types/gqlTypes';

const useDynamicViewFields = ({
  definition,
  values,
  bulk,
}: {
  definition: FormDefinitionJson;
  values?: Record<string, any>;
  bulk?: boolean;
}) => {
  const {
    itemMap,
    autofillDependencyMap,
    enabledDependencyMap,
    initiallyDisabledLinkIds = [],
  } = useComputedData({ definition, initialValues: values });

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

  const renderFields = useCallback(
    (
      props: Omit<
        DynamicViewFieldsProps,
        | 'definition'
        | 'itemMap'
        | 'autofillDependencyMap'
        | 'enabledDependencyMap'
        | 'disabledLinkIds'
        | 'setDisabledLinkIds'
        | 'values'
        | 'bulk'
      >
    ) => (
      <DynamicViewFields
        {...props}
        {...{
          definition,
          itemMap,
          autofillDependencyMap,
          enabledDependencyMap,
          disabledLinkIds,
          setDisabledLinkIds,
          values,
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

export default useDynamicViewFields;
