import {
  BulkServicesClientSearchDocument,
  useBulkAssignServiceMutation,
  useBulkRemoveServiceMutation,
} from '@/types/gqlTypes';

// Query to refetch after BulkAssign/BulkRemove. We need to refetch the table when the mutation completes,
// to get updated values for last service date & whether service is assigned on date (button state).
const refetchQueries = [
  BulkServicesClientSearchDocument,
  'BulkServicesClientSearch',
];

export function useBulkAssignMutations() {
  const [bulkAssign, { loading: assignLoading, error: assignErr }] =
    useBulkAssignServiceMutation({ refetchQueries });

  const [bulkRemove, { loading: removeLoading, error: removeErr }] =
    useBulkRemoveServiceMutation({ refetchQueries });

  return {
    bulkAssign,
    bulkRemove,
    loading: assignLoading || removeLoading,
    apolloError: assignErr || removeErr,
  } as const;
}
