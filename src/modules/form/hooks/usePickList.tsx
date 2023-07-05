import { QueryHookOptions } from '@apollo/client';
import { intersectionBy } from 'lodash-es';
import { useMemo } from 'react';

import { ChangeType, isPickListOption, isPickListOptionArray } from '../types';
import { hasMeaningfulValue, resolveOptionList } from '../util/formUtil';

import {
  FormItem,
  GetPickListQuery,
  GetPickListQueryVariables,
  PickListOption,
  PickListType,
  useGetPickListQuery,
} from '@/types/gqlTypes';

export const getValueFromPickListData = ({
  item,
  linkId,
  value,
  data,
  setInitial = true,
}: {
  item: FormItem;
  linkId: string;
  value: any;
  data: GetPickListQuery;
  setInitial?: boolean;
}) => {
  if (!data?.pickList) return;

  // If there is no value, look for InitialSelected value and set it
  if (!hasMeaningfulValue(value)) {
    // ...Except if we tell it not to
    if (!setInitial) return;

    const initial = item.repeats
      ? data.pickList.filter((o) => o.initialSelected)
      : data.pickList.find((o) => o.initialSelected);
    if (initial) {
      return { linkId, value: initial, type: ChangeType.System };
    }
    return;
  }

  // Try to find the "full" option (including label) for this value from the pick list
  let fullOption;
  if (isPickListOption(value)) {
    fullOption = data.pickList.find((o) => o.code === value.code);
  } else if (isPickListOptionArray(value)) {
    fullOption = intersectionBy(data.pickList, value, 'code');
  }

  if (fullOption) {
    // Update the value so that it shows the complete label
    return { linkId, value: fullOption, type: ChangeType.System };
  } else {
    console.warn(
      `Selected value '${JSON.stringify(
        value
      )}' is not present in option list '${item.pickListReference}'`
    );
  }
};

export function usePickList(
  item: FormItem,
  relationId?: string,
  fetchOptions?: QueryHookOptions<GetPickListQuery, GetPickListQueryVariables>
) {
  const resolved = useMemo(() => resolveOptionList(item), [item]);
  const isKnownType = useMemo(
    () =>
      item.pickListReference &&
      Object.values<string>(PickListType).includes(item.pickListReference),
    [item]
  );

  const { data, loading, error } = useGetPickListQuery({
    variables: {
      pickListType: item.pickListReference as PickListType,
      relationId,
    },
    // Skip if it was already resolve with local enums, or if it's an unrecognized reference
    skip: !!resolved || !isKnownType,
    ...fetchOptions,
  });

  const pickList = useMemo(() => {
    return resolved || data?.pickList || [];
  }, [data, resolved]);

  if (error) throw error;

  return [pickList, loading, !!resolved] as [
    pickList: PickListOption[] | undefined,
    loading: boolean,
    isLocal: boolean
  ];
}
