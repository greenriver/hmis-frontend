import { useMemo } from 'react';
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
  const [
    bulkAssign,
    { loading: assignLoading, error: assignErr, data: assignData },
  ] = useBulkAssignServiceMutation({ refetchQueries });

  const [
    bulkRemove,
    { loading: removeLoading, error: removeErr, data: removeData },
  ] = useBulkRemoveServiceMutation({ refetchQueries });

  const validationErrors = useMemo(() => {
    if (assignData?.bulkAssignService?.errors?.length) {
      return assignData.bulkAssignService.errors;
    }
    if (removeData?.bulkRemoveService?.errors?.length) {
      return removeData.bulkRemoveService.errors;
    }
    return [];
  }, [assignData, removeData]);

  return {
    bulkAssign,
    bulkRemove,
    loading: assignLoading || removeLoading,
    apolloError: assignErr || removeErr,
    validationErrors,
  };
}
