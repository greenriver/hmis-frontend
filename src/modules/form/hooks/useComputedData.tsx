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
  viewOnly?: boolean;
}

const useComputedData = ({
  definition,
  initialValues,
  viewOnly = false,
}: Args) => {
  return useMemo(() => {
    const itemMap = definition ? getItemMap(definition) : {};
    // { linkId => array of Link IDs that depend on it for autofill }
    const autofillDependencyMap = buildAutofillDependencyMap(itemMap, viewOnly);
    // { linkId => array of Link IDs that depend on it for enabled status }
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
  }, [definition, initialValues, viewOnly]);
};

export default useComputedData;
