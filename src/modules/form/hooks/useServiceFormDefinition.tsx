import { ApolloError } from '@apollo/client';
import { useMemo } from 'react';

import { getItemMap } from '../util/formUtil';

import { useGetServiceFormDefinitionQuery } from '@/types/gqlTypes';

interface Args {
  projectId: string;
  serviceTypeId?: string;
  onError?: (error: ApolloError) => void;
}
const useServiceFormDefinition = ({
  serviceTypeId,
  projectId,
  onError,
}: Args) => {
  const { data, loading } = useGetServiceFormDefinitionQuery({
    variables: { serviceTypeId: serviceTypeId || '', projectId },
    skip: !serviceTypeId,
    onError,
  });
  const { formDefinition, itemMap } = useMemo(() => {
    if (!data?.getServiceFormDefinition) return {};

    return {
      formDefinition: data.getServiceFormDefinition,
      itemMap: getItemMap(data.getServiceFormDefinition.definition, false),
    };
  }, [data]);

  return { formDefinition, itemMap, loading };
};

export default useServiceFormDefinition;
