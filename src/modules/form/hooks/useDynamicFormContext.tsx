import { createContext, useContext } from 'react';

import { ItemMap, LinkIdMap, LocalConstants } from '../types';

import { FormDefinitionJson } from '@/types/gqlTypes';

type DynamicFormContextType = {
  definition: FormDefinitionJson;
  itemMap: ItemMap;
  localConstants: LocalConstants;
  viewOnly: boolean;
  autofillInvertedDependencyMap: LinkIdMap;
  disabledDependencyMap: LinkIdMap;
};

export const DynamicFormContext = createContext<DynamicFormContextType>(
  {} as DynamicFormContextType
);

const useDynamicFormContext = () => {
  return useContext(DynamicFormContext);
};

export default useDynamicFormContext;
