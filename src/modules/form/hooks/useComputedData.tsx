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
    const items = definition ? getItemMap(definition) : {};
    const autofillMap = buildAutofillDependencyMap(items);
    const enabledMap = buildEnabledDependencyMap(items);
    const disabled = getDisabledLinkIds(items, initialValues || {});
    return { items, autofillMap, enabledMap, disabled };
  }, [definition, initialValues]);
};

export default useComputedData;
