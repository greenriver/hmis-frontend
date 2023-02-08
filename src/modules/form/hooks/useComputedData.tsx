import { useMemo } from 'react';

import {
  buildAutofillDependencyMap,
  buildEnabledDependencyMap,
  getDisabledLinkIds,
  getItemMap,
} from '../util/formUtil';

import { FormDefinitionJson } from '@/types/gqlTypes';

interface Args {
  initialValues?: Record<string, any>;
  definition: FormDefinitionJson;
}

const useComputedData = ({ definition, initialValues }: Args) => {
  return useMemo(() => {
    const itemMap = definition ? getItemMap(definition) : {};
    const autofillDependencyMap = buildAutofillDependencyMap(itemMap);
    const enabledDependencyMap = buildEnabledDependencyMap(itemMap);
    const initiallyDisabledLinkIds = getDisabledLinkIds(
      itemMap,
      initialValues || {}
    );
    return {
      itemMap,
      autofillDependencyMap,
      enabledDependencyMap,
      initiallyDisabledLinkIds,
    };
  }, [definition, initialValues]);
};

export default useComputedData;
