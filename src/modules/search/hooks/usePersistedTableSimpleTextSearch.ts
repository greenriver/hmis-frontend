import { useCallback, useEffect } from 'react';

import useDebouncedState from '@/hooks/useDebouncedState';
import useSearchParamsState from '@/hooks/useSearchParamState';
import useClientSearchParams from '@/modules/search/hooks/useClientSearchParams';
import { clientSearchInputToSearchParamsCacheFields } from '@/modules/search/searchUtil';

/**
 * Persists a single free-text table search in the URL as `searchQueryId`
 * (never the raw term), using Hmis::ClientSearchQuery / persistedClientSearchParams.
 *
 * Currently used by:
 * - CE Referrals table (`ReferralsTable`)
 * - CE Eligible Clients table (`AdminCeClientsTable`)
 *
 * Intentionally not used by Client Search or Bulk Services. Those flows need
 * richer search input (advanced fields, submit/clear forms, extra URL state)
 * and keep their own wiring. This hook only covers debounced single-field
 * `text_search` table search → URL restore.
 */
const usePersistedTableSimpleTextSearch = <TQuery>({
  getSearchQueryId,
}: {
  getSearchQueryId: (data: TQuery) => string | null | undefined;
}) => {
  // Plaintext search stays in component state; only searchQueryId is stored in the URL.
  const [search, setSearch, debouncedSearch] = useDebouncedState<string>('');
  const [{ searchQueryId }, setSearchParams] = useSearchParamsState({
    paramsDefinition: {
      searchQueryId: { type: 'string', default: null },
    },
  });

  const {
    clientSearchParams,
    loading: searchQueryIdLoading,
    writeClientSearchParamsToCache,
  } = useClientSearchParams({ searchQueryId });

  // Restore the input when navigating back / opening a URL with searchQueryId.
  useEffect(() => {
    if (clientSearchParams?.textSearch) {
      setSearch(clientSearchParams.textSearch);
    }
  }, [clientSearchParams, setSearch]);

  // Clear local search when searchQueryId is removed (e.g. browser Back).
  useEffect(() => {
    if (searchQueryId === null) setSearch('');
  }, [searchQueryId, setSearch]);

  // Clear the URL id when the user empties the input. Do this in the change
  // handler (not via debounced ''): an initial empty debounce during restore
  // would otherwise wipe searchQueryId before persisted params are applied.
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      if (value === '' && searchQueryId) {
        setSearchParams({ searchQueryId: null });
      }
    },
    [searchQueryId, setSearch, setSearchParams]
  );

  const restoredTerm = clientSearchParams?.textSearch || '';
  // Prefer the persisted term while restoring (input still empty) and after
  // restore has seeded `search` but debounce has not caught up yet.
  // Once the user types a different value, fall through to debounced search.
  const activeSearchTerm =
    restoredTerm && searchQueryId && (search === '' || search === restoredTerm)
      ? restoredTerm
      : (debouncedSearch ?? '');

  const onNetworkDataReady = useCallback(
    (data: TQuery) => {
      const returnedSearchQueryId = getSearchQueryId(data);
      if (returnedSearchQueryId && searchQueryId !== returnedSearchQueryId) {
        writeClientSearchParamsToCache(
          returnedSearchQueryId,
          clientSearchInputToSearchParamsCacheFields({
            textSearch: activeSearchTerm || null,
          })
        );
        setSearchParams({ searchQueryId: returnedSearchQueryId });
      }
    },
    [
      activeSearchTerm,
      getSearchQueryId,
      searchQueryId,
      setSearchParams,
      writeClientSearchParamsToCache,
    ]
  );

  return {
    search,
    setSearch: handleSearchChange,
    activeSearchTerm,
    searchQueryIdLoading,
    onNetworkDataReady,
  };
};

export default usePersistedTableSimpleTextSearch;
