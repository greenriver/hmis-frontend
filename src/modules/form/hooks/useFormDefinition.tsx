import { useMemo } from 'react';

import { getItemMap } from '../util/formUtil';

import {
  GetFormDefinitionQueryVariables,
  useGetFormDefinitionQuery,
} from '@/types/gqlTypes';

const useFormDefinition = (queryVariables: GetFormDefinitionQueryVariables) => {
  const { data, loading, error } = useGetFormDefinitionQuery({
    variables: queryVariables,
  });
  const { formDefinition, itemMap } = useMemo(() => {
    if (!data?.getFormDefinition) return {};

    return {
      formDefinition: data.getFormDefinition,
      itemMap: getItemMap(data.getFormDefinition.definition, false),
    };
  }, [data]);

  if (error)
    throw new Error(
      `Failed to fetch form definition for role ${queryVariables.role}`
    );

  return { formDefinition, itemMap, loading };
};

export default useFormDefinition;
