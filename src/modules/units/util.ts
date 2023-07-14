import { cache } from '@/providers/apolloClient';
import { PickListType } from '@/types/gqlTypes';
import { evictPickList } from '@/utils/cacheUtil';

export const evictUnitsQuery = (id: string) => {
  cache.evict({
    id: `Project:${id}`,
    fieldName: 'units',
  });
  cache.evict({
    id: `Project:${id}`,
    fieldName: 'unitTypes',
  });
  evictPickList(PickListType.AvailableUnitsForEnrollment);
};
