import { useCallback } from 'react';
import apolloClient from '@/providers/apolloClient';
import {
  GetSearchQueryDocument,
  SearchQueryFieldsFragment,
  useGetSearchQueryQuery,
} from '@/types/gqlTypes';

interface Props {
  searchQueryId?: string | null;
}
type SearchQueryFields = Omit<SearchQueryFieldsFragment, 'id' | '__typename'>;

type Result = {
  searchQuery: SearchQueryFieldsFragment | null;
  loading: boolean;
  writeSearchQueryToCache: (id: string, fields: SearchQueryFields) => void;
};

/**
 * Loads `searchQuery` by id
 */
const useSearchQuery = ({ searchQueryId }: Props): Result => {
  const skip = !searchQueryId;

  const { data, loading, error } = useGetSearchQueryQuery({
    variables: { id: searchQueryId || '' },
    skip,
    // cache-first is Apollo's default; Setting it explicitly to call out that having this uuid in the cache already is likely
    // if the user is navigating with the back-button, so we don't want to hit the network again in that case
    fetchPolicy: 'cache-first',
  });

  if (error) throw error;

  // Helper to write a search query to the cache. This can be used to
  // populate the cache with a search query when it is received from the server with a searchQueryId.
  const writeSearchQueryToCache = useCallback(
    (id: string, params: SearchQueryFields) => {
      apolloClient.writeQuery({
        query: GetSearchQueryDocument,
        variables: { id },
        data: { searchQuery: { __typename: 'SearchQuery', id, ...params } },
      });
    },
    []
  );

  return {
    searchQuery: data?.searchQuery || null,
    loading: skip ? false : loading,
    writeSearchQueryToCache,
  };
};

export default useSearchQuery;
