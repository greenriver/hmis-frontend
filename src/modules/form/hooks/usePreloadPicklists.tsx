import { FetchPolicy, QueryOptions, useApolloClient } from '@apollo/client';
import { compact, isEmpty } from 'lodash-es';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { ItemMap, PickListArgs } from '../types';
import { getItemMap } from '../util/formUtil';

import {
  FormDefinitionJson,
  GetPickListDocument,
  PickListOptionFieldsFragment,
  PickListType,
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

  const pickListTypesToFetch = useMemo(
    () =>
      compact(
        Object.values(itemMap || {})
          .map((item) => item.pickListReference)
          .filter(
            (reference) =>
              reference &&
              Object.values<string>(PickListType).includes(reference)
          )
      ),
    [itemMap]
  );

  const fetch = useCallback(() => {
    if (skip || isEmpty(pickListTypesToFetch)) {
      setLoading(false);
      return;
    }

    setLoading(true);
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
    loading: loading && Object.keys(data).length === 0,
    data,
  };
};

export default usePreloadPicklists;
