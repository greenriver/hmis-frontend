import { cache } from '@/providers/apolloClient';
import { PickListType } from '@/types/gqlTypes';

export const evictBedsQuery = (inventoryId: string) =>
  cache.evict({
    id: `Inventory:${inventoryId}`,
    fieldName: 'beds',
  });
export const evictUnitsQuery = (inventoryId: string) => {
  cache.evict({
    id: `Inventory:${inventoryId}`,
    fieldName: 'units',
  });
  cache.evict({
    id: 'ROOT_QUERY',
    fieldName: 'pickList',
    args: {
      pickListType: PickListType.AvailableUnits,
      relationId: inventoryId,
    },
  });
};
