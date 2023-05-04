import { cache } from '@/providers/apolloClient';
import { PickListType } from '@/types/gqlTypes';
import { evictPickList } from '@/utils/cacheUtil';

export const evictUnitPickList = (projectId: string) => {
  evictPickList(PickListType.AvailableUnits, projectId);
};

export const evictUnitsQuery = (id: string) => {
  cache.evict({
    id: `Project:${id}`,
    fieldName: 'units',
  });
  evictUnitPickList(id);
};
