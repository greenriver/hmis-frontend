import { useMemo } from 'react';

import { getItemMap } from '../util/formUtil';

import {
  FormDefinitionFieldsFragment,
  StaticFormRole,
  useGetStaticFormDefinitionQuery,
} from '@/types/gqlTypes';

const useStaticFormDefinition = (
  role: StaticFormRole,
  localDefinition?: FormDefinitionFieldsFragment
) => {
  const { data, loading, error } = useGetStaticFormDefinitionQuery({
    variables: { role },
    skip: !!localDefinition,
  });
  const { formDefinition, itemMap } = useMemo(() => {
    const formDefinition = localDefinition || data?.staticFormDefinition;
    if (!formDefinition) return {};
    return {
      formDefinition,
      itemMap: getItemMap(formDefinition.definition, false),
    };
  }, [data, localDefinition]);

  if (error) throw error;

  return { formDefinition, itemMap, loading };
};

export default useStaticFormDefinition;
