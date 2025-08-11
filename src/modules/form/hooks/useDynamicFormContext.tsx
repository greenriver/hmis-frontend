import { createContext, useContext } from 'react';

import { ItemMap, LocalConstants, PartialLinkIdMap } from '../types';

import { FormDefinitionJson } from '@/types/gqlTypes';

type DynamicFormContextType = {
  definition: FormDefinitionJson;
  itemMap: ItemMap;
  localConstants: LocalConstants;
  viewOnly: boolean;
  autofillInvertedDependencyMap: PartialLinkIdMap;
  disabledDependencyMap: PartialLinkIdMap;
  identifier?: string;
};

export const DynamicFormContext = createContext<DynamicFormContextType>(
  {} as DynamicFormContextType
);

const useDynamicFormContext = () => {
  return useContext(DynamicFormContext);
};

export default useDynamicFormContext;
