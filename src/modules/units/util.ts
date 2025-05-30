import { cache } from '@/providers/apolloClient';
import { PickListType } from '@/types/gqlTypes';
import { evictPickList } from '@/utils/cacheUtil';

export const evictUnitsQuery = (projectId: string, unitGroupId?: string) => {
  cache.evict({
    id: `Project:${projectId}`,
    fieldName: 'units',
  });
  cache.evict({
    id: `Project:${projectId}`,
    fieldName: 'unitTypes',
  });
  if (unitGroupId) {
    cache.evict({
      id: `UnitGroup:${unitGroupId}`,
      fieldName: 'units',
    });
  }
  evictPickList(PickListType.AvailableUnitsForEnrollment, { projectId });
};
