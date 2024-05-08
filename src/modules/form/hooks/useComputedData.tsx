import { useMemo } from 'react';
import { LocalConstants } from '../types';
import {
  buildAutofillDependencyMap,
  buildEnabledDependencyMap,
  getDisabledLinkIds,
  getItemMap,
  invertDependencyMap,
} from '../util/formUtil';

import { FormDefinitionJson } from '@/types/gqlTypes';

interface Args {
  initialValues?: Record<string, any>;
  definition: FormDefinitionJson;
  localConstants?: LocalConstants;
  viewOnly?: boolean;
}

const useComputedData = ({
  definition,
  initialValues,
  viewOnly = false,
  localConstants,
}: Args) => {
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

    const initiallyDisabledLinkIds = getDisabledLinkIds({
      itemMap,
      values: initialValues || {},
      localConstants: localConstants || {},
    });

    return {
      itemMap,
      autofillDependencyMap,
      autofillInvertedDependencyMap,
      enabledDependencyMap,
      initiallyDisabledLinkIds,
      disabledDependencyMap,
    };
  }, [definition, initialValues, viewOnly, localConstants]);
};

export default useComputedData;
