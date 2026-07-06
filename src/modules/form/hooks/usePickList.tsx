import { QueryHookOptions } from '@apollo/client';
import { useMemo } from 'react';

import { PickListArgs } from '../types';
import { resolveOptionList } from '../util/formUtil';

import {
  FormItem,
  GetPickListQuery,
  GetPickListQueryVariables,
  PickListType,
  useGetPickListQuery,
} from '@/types/gqlTypes';

export type PickListFetchOptions = Omit<
  QueryHookOptions<GetPickListQuery, GetPickListQueryVariables>,
  // Omit deprecated Apollo callbacks to make sure we don't re-introduce them.
  'onCompleted' | 'onError'
>;

export function usePickList({
  item,
  fetchOptions,
  ...pickListArgs
}: {
  item: FormItem;
  fetchOptions?: PickListFetchOptions;
} & PickListArgs) {
  const resolved = useMemo(() => resolveOptionList(item), [item]);
  const isKnownType = useMemo(
    () =>
      item.pickListReference &&
      Object.values<string>(PickListType).includes(item.pickListReference),
    [item]
  );

  const { data, loading, error } = useGetPickListQuery({
    variables: {
      pickListType: item.pickListReference as PickListType,
      ...pickListArgs,
    },
    // Skip if it was already resolve with local enums, or if it's an unrecognized reference
    skip: !!resolved || !isKnownType,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    ...fetchOptions,
  });

  const pickList = useMemo(() => {
    return resolved || data?.pickList || [];
  }, [data, resolved]);

  if (error) throw error;

  return { pickList, loading, isLocalPickList: !!resolved } as const;
}
