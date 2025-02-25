import { FetchPolicy, QueryOptions, useApolloClient } from '@apollo/client';
import { isEmpty } from 'lodash-es';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { ItemMap, PickListArgs } from '../types';
import { getItemMap, itemHasRemotePicklist } from '../util/formUtil';

import {
  FormDefinitionJson,
  GetPickListDocument,
  PickListOptionFieldsFragment,
} from '@/types/gqlTypes';

interface Args {
  definition: FormDefinitionJson | undefined;
  pickListArgs?: PickListArgs;
  queryOptions?: Omit<QueryOptions, 'query'>;
  skip?: boolean;
  fetchPolicy?: FetchPolicy;
}
const usePreloadPicklists = ({
  definition,
  pickListArgs,
  queryOptions,
  fetchPolicy,
  skip,
}: Args) => {
  const client = useApolloClient();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<
    Record<string, PickListOptionFieldsFragment[]>
  >({});

  const itemMap: ItemMap = useMemo(
    () => (definition ? getItemMap(definition) : {}),
    [definition]
  );

  // Get all `pickListReference` values from the Form Definition
  const pickListTypesToFetch = useMemo(() => {
    if (skip) return [];

    const references = Object.values(itemMap)
      .filter(itemHasRemotePicklist)
      .map((item) => item.pickListReference);
    return [...new Set(references)];
  }, [itemMap, skip]);

  const fetch = useCallback(() => {
    if (skip || isEmpty(pickListTypesToFetch)) {
      setLoading(false);
      return;
    }

    setLoading(true);
    // Fetch all picklists
    Promise.all(
      pickListTypesToFetch.map((pickListType) =>
        client.query({
          query: GetPickListDocument,
          variables: { ...pickListArgs, pickListType },
          fetchPolicy: fetchPolicy,
          ...queryOptions,
        })
      )
    )
      .then((results) => {
        const zipped = Object.fromEntries(
          pickListTypesToFetch.map((p, i) => [
            p,
            results[i].data.pickList as PickListOptionFieldsFragment[],
          ])
        );
        setData(zipped);
      })
      .catch(() => setData({}))
      .finally(() => setLoading(false));
  }, [
    skip,
    pickListTypesToFetch,
    client,
    pickListArgs,
    queryOptions,
    fetchPolicy,
  ]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    fetch,
    loading:
      loading &&
      pickListTypesToFetch.length > 0 && // always loading:false if there was no fetch
      Object.keys(data).length === 0,
    data,
  };
};

export default usePreloadPicklists;
