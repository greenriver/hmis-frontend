import { QueryOptions, useApolloClient } from '@apollo/client';
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
}
const usePreloadPicklists = ({
  definition,
  pickListArgs,
  queryOptions,
  skip,
}: Args) => {
  const client = useApolloClient();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PickListOptionFieldsFragment[]>([]);

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
          fetchPolicy: 'network-only',
          ...queryOptions,
        })
      )
    )
      .then((results) => {
        setData(
          results.map(
            (result) => result.data.pickList as PickListOptionFieldsFragment
          )
        );
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [skip, pickListTypesToFetch, client, pickListArgs, queryOptions]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return useMemo(
    () => ({
      fetch,
      loading: loading && data.length === 0,
      data,
    }),
    [fetch, loading, data]
  );
};

export default usePreloadPicklists;
