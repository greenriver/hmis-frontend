import { NetworkStatus } from '@apollo/client';
import { useEffect } from 'react';

import usePrevious from '@/hooks/usePrevious';

type UseNetworkDataReadyProps<Query> = {
  data?: Query;
  networkStatus: NetworkStatus;
  callback?: (data: Query) => void;
};

/**
 * Calls `callback` after an Apollo query moves from an in-flight networkStatus to ready.
 * The query must pass `notifyOnNetworkStatusChange: true` so status transitions are observable. 
 */
export function useNetworkDataReady<Query>({
  data,
  networkStatus,
  callback,
}: UseNetworkDataReadyProps<Query>) {
  const previousNetworkStatus = usePrevious(networkStatus);

  useEffect(() => {
    if (
      data &&
      callback &&
      // Previous network status was in-flight
      !!previousNetworkStatus &&
      ![NetworkStatus.ready, NetworkStatus.error].includes(
        previousNetworkStatus
      ) &&
      // Current network status is ready
      networkStatus === NetworkStatus.ready
    ) {
      callback(data);
    }
  }, [data, networkStatus, callback, previousNetworkStatus]);
}
