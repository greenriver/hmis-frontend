import { useEffect, useState } from 'react';

// See for statuses 2/3/4:  https://github.com/apollographql/apollo-client/blob/d96f4578f89b933c281bb775a39503f6cdb59ee8/src/core/networkStatus.ts#L12-L28
const STATUSES_INDICATING_REFETCH = [2, 3, 4];

export default function useHasRefetched(networkStatus: number) {
  const [hasRefetched, setHasRefetched] = useState(false);

  useEffect(() => {
    if (STATUSES_INDICATING_REFETCH.includes(networkStatus))
      setHasRefetched(true);
  }, [networkStatus]);

  return hasRefetched;
}
