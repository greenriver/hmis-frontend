import { QueryHookOptions } from '@apollo/client';
import { useMemo } from 'react';

import { resolveOptionList } from '../util/formUtil';

import {
  FormItem,
  GetPickListQuery,
  GetPickListQueryVariables,
  PickListOption,
  PickListType,
  useGetPickListQuery,
} from '@/types/gqlTypes';

export function usePickList(
  item: FormItem,
  fetchOptions?: QueryHookOptions<GetPickListQuery, GetPickListQueryVariables>
) {
  const resolved = useMemo(() => resolveOptionList(item), [item]);
  const isKnownType = useMemo(
    () =>
      item.pickListReference &&
      Object.values<string>(PickListType).includes(item.pickListReference),
    [item]
  );

  const { data, loading, error } = useGetPickListQuery({
    variables: { pickListType: item.pickListReference as PickListType },
    // Skip if it was already resolve with local enums, or if it's an unrecognized reference
    skip: !!resolved || !isKnownType,
    ...fetchOptions,
  });

  const pickList = useMemo(() => {
    return resolved || data?.pickList || [];
  }, [data, resolved]);

  if (error) throw error;

  return [pickList, loading] as [
    pickList: PickListOption[] | undefined,
    loading: boolean
  ];
}
