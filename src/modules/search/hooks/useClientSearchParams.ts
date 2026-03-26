import { useCallback } from 'react';
import apolloClient from '@/providers/apolloClient';
import {
  ClientSearchParamsFieldsFragment,
  GetPersistedClientSearchParamsDocument,
  useGetPersistedClientSearchParamsQuery,
} from '@/types/gqlTypes';

interface Props {
  searchQueryId?: string | null;
}
type ClientSearchParamsFields = Omit<
  ClientSearchParamsFieldsFragment,
  'id' | '__typename'
>;

type Result = {
  clientSearchParams: ClientSearchParamsFieldsFragment | null;
  loading: boolean;
  writeClientSearchParamsToCache: (
    id: string,
    fields: ClientSearchParamsFields
  ) => void;
};

/**
 * Loads persisted client search params by id (URL `searchQueryId`).
 */
const useClientSearchParams = ({ searchQueryId }: Props): Result => {
  const skip = !searchQueryId;

  const { data, loading, error } = useGetPersistedClientSearchParamsQuery({
    variables: { id: searchQueryId || '' },
    skip,
    // cache-first is Apollo's default; Setting it explicitly to call out that having this uuid in the cache already is likely
    // if the user is navigating with the back-button, so we don't want to hit the network again in that case
    fetchPolicy: 'cache-first',
  });

  if (error) throw error;

  // Helper to write persisted params to the cache when the server returns a new searchQueryId.
  const writeClientSearchParamsToCache = useCallback(
    (id: string, params: ClientSearchParamsFields) => {
      apolloClient.writeQuery({
        query: GetPersistedClientSearchParamsDocument,
        variables: { id },
        data: {
          persistedClientSearchParams: {
            __typename: 'ClientSearchParams' as const,
            id,
            ...params,
          },
        },
      });
    },
    []
  );

  return {
    clientSearchParams: data?.persistedClientSearchParams || null,
    loading: skip ? false : loading,
    writeClientSearchParamsToCache,
  };
};

export default useClientSearchParams;
