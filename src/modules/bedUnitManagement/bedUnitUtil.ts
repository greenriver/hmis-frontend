import { cache } from '@/providers/apolloClient';
import { PickListType } from '@/types/gqlTypes';

export const evictBedsQuery = (inventoryId: string) =>
  cache.evict({
    id: `Inventory:${inventoryId}`,
    fieldName: 'beds',
  });

export const evictUnitPickList = (inventoryId: string) => {
  cache.evict({
    id: 'ROOT_QUERY',
    fieldName: 'pickList',
    args: {
      pickListType: PickListType.AvailableUnits,
      relationId: inventoryId,
    },
  });
};

export const evictUnitsQuery = (inventoryId: string) => {
  cache.evict({
    id: `Inventory:${inventoryId}`,
    fieldName: 'units',
  });
  evictUnitPickList(inventoryId);
};
