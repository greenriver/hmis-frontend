import { Cache } from '@apollo/client';

import { isMatch } from 'lodash-es';
import { PickListArgs } from '@/modules/form/types';
import { cache } from '@/providers/apolloClient';
import { PickListType, Query } from '@/types/gqlTypes';

/**
 * Evict picklist of a particular type, with a PARTIAL match on args.
 *
 * For example:
 * evictPickList(AVAILABLE_UNITS_FOR_ENROLLMENT, { projectId, householdId }) evicts picklists for the specific args
 * evictPickList(AVAILABLE_UNITS_FOR_ENROLLMENT, { projectId }) evicts picklists of that type for that project, regardless of whether householdId was passed
 * evictPickList(AVAILABLE_UNITS_FOR_ENROLLMENT) evicts ALL picklists of that type
 */
export const evictPickList = (
  pickListType: PickListType,
  pickListArgs?: PickListArgs
) =>
  cache.modify({
    fields: {
      pickList: (existing, { storeFieldName, DELETE }) => {
        const matches = storeFieldName.match(/pickList\((.*)\)/);
        if (matches && matches.length >= 2) {
          const parsedArgs = JSON.parse(matches[1]);
          if (isMatch(parsedArgs, { pickListType, ...pickListArgs })) {
            return DELETE;
          }
        }
        return existing;
      },
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

export const evictDeletedEnrollment = ({
  enrollmentId,
  clientId,
}: {
  enrollmentId: string;
  clientId: string;
}) => {
  cache.evict({ id: `Enrollment:${enrollmentId}` });
  cache.evict({ id: `Client:${clientId}`, fieldName: 'enrollments' });
};

export const evictProjectConfigs = () =>
  cache.evict({ id: 'ROOT_QUERY', fieldName: 'projectConfigs' });
