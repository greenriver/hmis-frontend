import { cloneDeep } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';
import { DefaultValues, FieldValues } from 'react-hook-form';
import usePreloadPicklists from '@/modules/form/hooks/usePreloadPicklists';
import { LocalConstants, PickListArgs } from '@/modules/form/types';
import {
  autofillValues,
  getInitialValues,
  getItemMap,
} from '@/modules/form/util/formUtil';
import { FormDefinitionJson } from '@/types/gqlTypes';

interface Args<T extends FieldValues> {
  definition: FormDefinitionJson;
  initialValues?: T;
  localConstants?: LocalConstants;
  viewOnly?: boolean;
  pickListArgs?: PickListArgs;
}

// we get incomplete form data and need to enrich it using local constants and pick lists before it can be displayed
export const useEnrichedFormData = <T extends FieldValues>({
  definition,
  initialValues = {} as T,
  localConstants = {},
  viewOnly = false,
  pickListArgs,
}: Args<T>) => {
  // we also calculate itemMap in useComputedData() which is redundant. Could optimize this by sharing the same state
  const itemMap = useMemo(() => getItemMap(definition), [definition]);

  const { data: picklistValues, loading } = usePreloadPicklists({
    definition: definition,
    pickListArgs,
  });

  const [defaultValues] = useState<DefaultValues<T>>(() => {
    const newValues: Record<string, any> = {
      ...getInitialValues(definition, localConstants),
      ...cloneDeep(initialValues),
    };
    Object.keys(itemMap).forEach((linkId) => {
      const change = autofillValues({
        item: itemMap[linkId],
        values: newValues,
        itemMap,
        localConstants: localConstants || {},
        viewOnly,
      });
      //console.info('form init autofill', linkId, change)
      if (change) newValues[linkId] = change.value;
    });
    return newValues as DefaultValues<T>;
  });

  // supplement with data from picklist
  const [result, setResult] = useState<DefaultValues<T> | undefined>(undefined);
  useEffect(() => {
    if (loading || result) return;
    const mutation = cloneDeep(defaultValues);
    Object.values(itemMap || {}).forEach(({ pickListReference, linkId }) => {
      if (!pickListReference || !picklistValues[pickListReference]) return;
      const found = picklistValues[pickListReference].find((i) => {
        return i.code === defaultValues[linkId].code;
      });
      // console.info('update', linkId, found)
      if (found) mutation[linkId] = found;
    });
    setResult(mutation);
  }, [loading, defaultValues, itemMap, picklistValues, result]);

  return { defaultValues: result, loading };
};
