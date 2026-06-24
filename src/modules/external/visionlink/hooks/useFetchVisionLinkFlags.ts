import { useCallback, useState } from 'react';
import { emptyErrorState, ErrorState } from '@/modules/errors/util';
import { buildVisionLinkFlagValues } from '@/modules/external/visionlink/visionLinkUtils';
import {
  AhaFailedReason,
  useFetchVisionLinkFlagsMutation,
} from '@/types/gqlTypes';

interface UseFetchVisionLinkFlagsOptions {
  clientId: string | undefined;
  onFlagsFetched?: (flagValues: Record<string, string>) => void;
}

export function useFetchVisionLinkFlags({
  clientId,
  onFlagsFetched,
}: UseFetchVisionLinkFlagsOptions) {
  const [errorState, setErrorState] = useState<ErrorState>(emptyErrorState);
  const [failedReason, setFailedReason] = useState<
    AhaFailedReason | undefined | null
  >();
  const [hasFetched, setHasFetched] = useState(false);

  const [fetchVisionLinkFlags, { loading }] = useFetchVisionLinkFlagsMutation({
    variables: {
      clientId: clientId || '',
    },
    onCompleted: (data) => {
      const result = data.fetchVisionLinkFlags;
      const errors = result?.errors || [];
      if (errors.length > 0) {
        setErrorState({ ...emptyErrorState, errors });
        return;
      }

      const { flagValues, failedReason } = buildVisionLinkFlagValues(result);

      setHasFetched(true);
      setErrorState(emptyErrorState);
      setFailedReason(failedReason);
      onFlagsFetched?.(flagValues);
    },
    onError: (apolloError) => {
      setErrorState({ ...emptyErrorState, apolloError });
    },
  });

  const handleFetch = useCallback(() => {
    if (clientId) fetchVisionLinkFlags();
  }, [fetchVisionLinkFlags, clientId]);

  return {
    loading,
    errorState,
    failedReason,
    hasFetched,
    fetchVisionLinkFlags: handleFetch,
  };
}
