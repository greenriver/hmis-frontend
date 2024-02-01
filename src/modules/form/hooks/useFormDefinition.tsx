import { useMemo } from 'react';

import { getItemMap } from '../util/formUtil';

import {
  FormDefinitionFieldsFragment,
  GetFormDefinitionQueryVariables,
  useGetFormDefinitionQuery,
} from '@/types/gqlTypes';

const useFormDefinition = (
  queryVariables: GetFormDefinitionQueryVariables,
  // Bypass query by passing a local definition instead
  localDefinition?: FormDefinitionFieldsFragment
) => {
  const { data, loading, error } = useGetFormDefinitionQuery({
    variables: queryVariables,
    skip: !!localDefinition,
  });
  const { formDefinition, itemMap } = useMemo(() => {
    const formDefinition = localDefinition || data?.recordFormDefinition;
    if (!formDefinition) return {};
    return {
      formDefinition,
      itemMap: getItemMap(formDefinition.definition, false),
    };
  }, [data?.recordFormDefinition, localDefinition]);

  if (error)
    throw new Error(
      `Failed to fetch form definition for role ${queryVariables.role}`
    );

  return { formDefinition, itemMap, loading };
};

export default useFormDefinition;
