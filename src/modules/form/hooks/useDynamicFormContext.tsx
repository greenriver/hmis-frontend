import { createContext, useContext } from 'react';

import { FormValues } from '../types';

import { FormDefinitionJson } from '@/types/gqlTypes';

type DynamicFormContextType = {
  getValues?: () => FormValues;
  definition?: FormDefinitionJson;
};

export const DynamicFormContext = createContext<DynamicFormContextType>({});

const useDynamicFormContext = () => {
  return useContext(DynamicFormContext);
};

export default useDynamicFormContext;
