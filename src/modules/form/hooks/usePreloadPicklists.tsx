import { useApolloClient, useLazyQuery } from '@apollo/client';
import { compact, isEmpty } from 'lodash-es';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { ItemMap } from '../types';

import {
  GetPickListDocument,
  PickListOptionFieldsFragment,
  PickListType,
} from '@/types/gqlTypes';

const usePreloadPicklists = (
  itemMap: ItemMap | undefined,
  relationId?: string
) => {
  const [doQuery] = useLazyQuery(GetPickListDocument);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PickListOptionFieldsFragment[]>([]);
  const client = useApolloClient();

  const pickListTypes = useMemo(
    () =>
      compact(
        Object.values(itemMap || {})
          .map((item) => (item.hidden ? null : item.pickListReference))
          .filter((reference) => {
            const isValid =
              reference &&
              Object.values<string>(PickListType).includes(reference);
            const isFetched = client.readQuery({
              query: GetPickListDocument,
              variables: { relationId, pickListType: reference },
            });

            if (isValid && !isFetched) return true;

            return false;
          })
      ),
    [itemMap, client, relationId]
  );

  const fetch = useCallback(() => {
    if (isEmpty(pickListTypes)) return;

    setLoading(true);
    Promise.all(
      pickListTypes.map((pickListType) =>
        doQuery({ variables: { relationId, pickListType } })
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
  }, [doQuery, pickListTypes, relationId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return useMemo(
    () => ({
      fetch,
      loading,
      data,
    }),
    [fetch, loading, data]
  );
};

export default usePreloadPicklists;
