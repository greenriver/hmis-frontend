import { useMemo } from 'react';

import { resolveOptionList } from '../util/formUtil';

import {
  FormItem,
  PickListOption,
  PickListType,
  useGetPickListQuery,
} from '@/types/gqlTypes';

export function usePickList(item: FormItem) {
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
  });

  const list = useMemo(() => {
    if (resolved) return resolved;
    return data?.pickList;
  }, [data, resolved]);

  if (error) throw error;

  return [list, loading] as [
    list: PickListOption[] | undefined,
    loading: boolean
  ];
}
