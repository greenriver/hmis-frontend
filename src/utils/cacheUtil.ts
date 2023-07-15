import { Cache } from '@apollo/client';

import { PickListArgs } from '@/modules/form/types';
import { cache } from '@/providers/apolloClient';
import { PickListType, Query } from '@/types/gqlTypes';

export const evictPickList = (
  pickListType: PickListType,
  pickListArgs?: PickListArgs
) =>
  cache.evict({
    id: 'ROOT_QUERY',
    fieldName: 'pickList',
    args: {
      pickListType,
      ...pickListArgs,
    },
  });

export const evictQuery = (
  query: keyof Query,
  args?: Cache.EvictOptions['args']
) =>
  cache.evict({
    id: 'ROOT_QUERY',
    fieldName: query,
    args,
  });
