import { useMemo } from 'react';
import {
  buildAutofillDependencyMap,
  buildBoundsDependencyMap,
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
    const boundsDependencyMap = buildBoundsDependencyMap(itemMap);
    const boundsInvertedDependencyMap =
      invertDependencyMap(boundsDependencyMap);

    return {
      itemMap,
      autofillDependencyMap,
      autofillInvertedDependencyMap,
      boundsInvertedDependencyMap,
      enabledDependencyMap,
      disabledDependencyMap,
    };
  }, [definition, viewOnly]);
};

export default useComputedData;
