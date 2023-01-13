import { Cache } from '@apollo/client';

import { cache } from '@/providers/apolloClient';
import { PickListType, Query } from '@/types/gqlTypes';

export const evictPickList = (
  pickListType: PickListType,
  relationId?: string
) =>
  cache.evict({
    id: 'ROOT_QUERY',
    fieldName: 'pickList',
    args: {
      pickListType,
      relationId,
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
