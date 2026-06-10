import { useMemo } from 'react';

import { getItemMap } from '../util/formUtil';

import { useGetServiceFormDefinitionQuery } from '@/types/gqlTypes';

interface Args {
  projectId: string;
  serviceTypeId?: string;
  formDefinitionId?: string | null; // provided when editing existing service
}
const useServiceFormDefinition = ({
  serviceTypeId,
  projectId,
  formDefinitionId,
}: Args) => {
  const { data, loading } = useGetServiceFormDefinitionQuery({
    variables: {
      serviceTypeId: serviceTypeId || '',
      projectId,
      formDefinitionId,
    },
    skip: !serviceTypeId,
  });

  const { formDefinition, itemMap } = useMemo(() => {
    if (!data?.serviceFormDefinition) return {};

    return {
      formDefinition: data.serviceFormDefinition,
      itemMap: getItemMap(data.serviceFormDefinition.definition, false),
    };
  }, [data]);

  return { formDefinition, itemMap, loading };
};

export default useServiceFormDefinition;
