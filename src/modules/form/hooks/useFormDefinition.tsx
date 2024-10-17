import { useMemo } from 'react';

import { getItemMap } from '../util/formUtil';

import {
  FormDefinitionFieldsFragment,
  GetFormDefinitionQuery,
  GetFormDefinitionQueryVariables,
  useGetFormDefinitionQuery,
} from '@/types/gqlTypes';

const useFormDefinition = (
  queryVariables: GetFormDefinitionQueryVariables,
  // Bypass query by passing a local definition instead
  localDefinition?: FormDefinitionFieldsFragment,
  onCompleted?: (data: GetFormDefinitionQuery) => void
) => {
  const { data, loading, error } = useGetFormDefinitionQuery({
    variables: queryVariables,
    skip: !!localDefinition,
    onCompleted,
  });
  const { formDefinition, itemMap } = useMemo(() => {
    const formDefinition = localDefinition || data?.recordFormDefinition;
    if (!formDefinition) return {};
    return {
      formDefinition,
      itemMap: getItemMap(formDefinition.definition, false),
    };
  }, [data?.recordFormDefinition, localDefinition]);

  if (error) throw error;

  if (!formDefinition && !loading)
    throw new Error(`Form not found: ${JSON.stringify(queryVariables)} `);

  return { formDefinition, itemMap, loading };
};

export default useFormDefinition;
