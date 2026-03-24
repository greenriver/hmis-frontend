import {
  SearchQueryFieldsFragment,
  useGetSearchQueryQuery,
} from '@/types/gqlTypes';

interface Props {
  searchQueryId?: string | null;
}

type Result = {
  searchQuery: SearchQueryFieldsFragment | null;
  loading: boolean;
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

  return {
    searchQuery: data?.searchQuery || null,
    loading: skip ? false : loading,
  };
};

export default useSearchQuery;
