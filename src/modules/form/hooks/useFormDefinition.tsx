import { useMemo } from 'react';

import { getItemMap } from '../util/formUtil';

import { FormRole, useGetFormDefinitionQuery } from '@/types/gqlTypes';

const useFormDefinition = (role: FormRole) => {
  const { data, loading, error } = useGetFormDefinitionQuery({
    variables: { role },
  });
  const { formDefinition, itemMap } = useMemo(() => {
    if (!data?.getFormDefinition) return {};

    return {
      formDefinition: data.getFormDefinition,
      itemMap: getItemMap(data.getFormDefinition.definition, false),
    };
  }, [data]);

  if (error)
    throw new Error(`Failed to fetch form definition for role ${role}`);

  return { formDefinition, itemMap, loading };
};

export default useFormDefinition;
