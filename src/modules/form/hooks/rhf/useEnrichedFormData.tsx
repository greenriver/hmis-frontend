import * as Sentry from '@sentry/react';
import { cloneDeep } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';
import { DefaultValues, FieldValues } from 'react-hook-form';
import usePreloadPicklists from '@/modules/form/hooks/usePreloadPicklists';
import { LocalConstants, PickListArgs } from '@/modules/form/types';
import {
  autofillValues,
  formHasAnyRemotePicklists,
  getInitialValues,
  getItemMap,
} from '@/modules/form/util/formUtil';
import { FormDefinitionJson, PickListType } from '@/types/gqlTypes';

const handleError = (message: string) => {
  // console.info('error', message)
  Sentry.captureMessage(message, { level: 'error' });
};

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

  // If form doesn't have any remote picklists, we can skip the fetch
  const hasRemotePicklists = useMemo(
    () => formHasAnyRemotePicklists(itemMap),
    [itemMap]
  );

  const { data: picklistValues, loading } = usePreloadPicklists({
    definition: definition,
    pickListArgs,
    skip: !hasRemotePicklists,
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
  const [enrichedDefaultValues, setEnrichedDefaultValues] = useState<
    DefaultValues<T> | undefined
  >(undefined);

  useEffect(() => {
    // Form has no remote picklists; nothing to enrich
    if (!hasRemotePicklists) return;
    // Remote picklists are loading, wait
    if (loading) return;
    // Default values have already been enriched
    if (!!enrichedDefaultValues) return;

    const clonedValues = cloneDeep(defaultValues);
    Object.values(itemMap || {}).forEach(({ pickListReference, linkId }) => {
      const valueCode = clonedValues[linkId]?.code || clonedValues[linkId];
      // skip unless there's a value and a value code
      if (!valueCode) return;
      if (!pickListReference) return;
      if (!Object.values<string>(PickListType).includes(pickListReference))
        return;

      if (!picklistValues[pickListReference]) {
        // this shouldn't occur
        handleError(`Could not find pick list "${pickListReference}"`);
        return;
      }
      const found = picklistValues[pickListReference].find(
        (i) => i.code === valueCode
      );
      if (!found) {
        handleError(
          `Pick list "${pickListReference}" does not contain code "${valueCode}"`
        );
        return;
      }
      if (found) clonedValues[linkId] = found;
    });
    setEnrichedDefaultValues(clonedValues);
  }, [
    loading,
    defaultValues,
    itemMap,
    picklistValues,
    hasRemotePicklists,
    enrichedDefaultValues,
  ]);

  return {
    defaultValues: hasRemotePicklists ? enrichedDefaultValues : defaultValues,
    loading,
  };
};
