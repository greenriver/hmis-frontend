import { cache } from '@/providers/apolloClient';
import { PickListType } from '@/types/gqlTypes';
import { evictPickList } from '@/utils/cacheUtil';

export const evictBedsQuery = (inventoryId: string) =>
  cache.evict({
    id: `Inventory:${inventoryId}`,
    fieldName: 'beds',
  });

export const evictUnitPickList = (inventoryId: string) => {
  evictPickList(PickListType.AvailableUnits, inventoryId);
};

export const evictUnitsQuery = (inventoryId: string) => {
  cache.evict({
    id: `Inventory:${inventoryId}`,
    fieldName: 'units',
  });
  evictUnitPickList(inventoryId);
};
