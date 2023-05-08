import { useLazyQuery } from '@apollo/client';
import { compact, isEmpty } from 'lodash-es';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { ItemMap } from '../types';

import useStabilizedValue from '@/hooks/useStabilizedValue';
import {
  GetPickListDocument,
  PickListOptionFieldsFragment,
  PickListType,
} from '@/types/gqlTypes';

const usePreloadPicklists = (
  itemMap: ItemMap | undefined,
  relationId?: string
) => {
  const [fetchPickList] = useLazyQuery(GetPickListDocument);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PickListOptionFieldsFragment[]>([]);
  // Stabilize the value in case we're not careful about reference equality on the input
  const stabilizedItemMap = useStabilizedValue(itemMap);

  const pickListTypesToFetch = useMemo(
    () =>
      compact(
        Object.values(stabilizedItemMap || {})
          .map((item) => (item.hidden ? null : item.pickListReference))
          .filter((reference) => {
            const isValid =
              reference &&
              Object.values<string>(PickListType).includes(reference);

            if (isValid) return true;

            return false;
          })
      ),
    [stabilizedItemMap]
  );

  const fetch = useCallback(() => {
    if (isEmpty(pickListTypesToFetch)) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all(
      pickListTypesToFetch.map((pickListType) =>
        fetchPickList({ variables: { relationId, pickListType } })
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
  }, [fetchPickList, pickListTypesToFetch, relationId]);

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
