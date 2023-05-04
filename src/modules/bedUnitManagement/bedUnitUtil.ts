import { cache } from '@/providers/apolloClient';
import { PickListType } from '@/types/gqlTypes';
import { evictPickList } from '@/utils/cacheUtil';

export const evictUnitPickList = (inventoryId: string) => {
  evictPickList(PickListType.AvailableUnits, inventoryId);
};

export const evictUnitsQuery = (id: string) => {
  cache.evict({
    id: `Project:${id}`,
    fieldName: 'units',
  });
  evictUnitPickList(id);
};
