import { useGetSearchQueryQuery } from '@/types/gqlTypes';

interface UseResolvedSearchQueryIdProps {
  searchQueryId?: string;
  user?: any;
}

// todo @Martha - add current user
const useResolvedSearchQueryId = ({
  searchQueryId,
}: UseResolvedSearchQueryIdProps) => {
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
    resolvedParams: data?.searchQuery?.params,
    loading: skip ? false : loading,
  };
};

export default useResolvedSearchQueryId;
