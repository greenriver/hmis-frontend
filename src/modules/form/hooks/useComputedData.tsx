import { useMemo } from 'react';
import {
  buildAutofillDependencyMap,
  buildEnabledDependencyMap,
  getItemMap,
  invertDependencyMap,
} from '../util/formUtil';

import { FormDefinitionJson } from '@/types/gqlTypes';

interface Args {
  definition: FormDefinitionJson;
  viewOnly?: boolean;
}

const useComputedData = ({ definition, viewOnly = false }: Args) => {
  return useMemo(() => {
    const itemMap = definition ? getItemMap(definition) : {};
    // { linkId => array of Link IDs that depend on it for autofill }
    const autofillDependencyMap = buildAutofillDependencyMap(itemMap, viewOnly);
    const autofillInvertedDependencyMap = invertDependencyMap(
      autofillDependencyMap
    );
    // { linkId => array of Link IDs that depend on it for enabled status }
    const enabledDependencyMap = buildEnabledDependencyMap(itemMap);
    const disabledDependencyMap = invertDependencyMap(enabledDependencyMap);

    return {
      itemMap,
      autofillDependencyMap,
      autofillInvertedDependencyMap,
      enabledDependencyMap,
      disabledDependencyMap,
    };
  }, [definition, viewOnly]);
};

export default useComputedData;
