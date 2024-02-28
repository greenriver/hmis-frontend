import {
  BulkServicesClientSearchDocument,
  useBulkAssignServiceMutation,
  useBulkRemoveServiceMutation,
} from '@/types/gqlTypes';

export function useBulkAssignMutations() {
  const [bulkAssign, { loading: assignLoading, error: assignErr }] =
    useBulkAssignServiceMutation({
      // Refetch table when mutation completes,
      // to get updated values for last service date &
      // whether service is assigned on date
      refetchQueries: [
        BulkServicesClientSearchDocument,
        'BulkServicesClientSearch',
      ],
    });

  const [bulkRemove, { loading: removeLoading, error: removeErr }] =
    useBulkRemoveServiceMutation({
      refetchQueries: [
        BulkServicesClientSearchDocument,
        'BulkServicesClientSearch',
      ],
    });

  return {
    bulkAssign,
    bulkRemove,
    loading: assignLoading || removeLoading,
    apolloError: assignErr || removeErr,
  } as const;
}
