import * as Sentry from '@sentry/react';
import { cloneDeep } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';
import { DefaultValues, FieldValues } from 'react-hook-form';
import usePreloadPicklists from '@/modules/form/hooks/usePreloadPicklists';
import { LocalConstants, PickListArgs } from '@/modules/form/types';
import {
  autofillValues,
  formHasAnyRemotePicklists,
  getEnrichedValueForChoiceItem,
  getInitialValues,
  getItemMap,
} from '@/modules/form/util/formUtil';
import { FormDefinitionJson } from '@/types/gqlTypes';

const handleError = (message: string) => {
  if (import.meta.env.MODE === 'development') {
    console.error(message);
  }
  Sentry.captureMessage(message, { level: 'error' });
};

interface Args<T extends FieldValues> {
  definition: FormDefinitionJson;
  initialValues?: T;
  localConstants?: LocalConstants;
  viewOnly?: boolean;
  pickListArgs?: PickListArgs;
}

// We get incomplete form data and need to enrich it using local constants and pick lists before it can be displayed.
//
// This includes enriching incomplete values for "choice" items based on their pick lists, for example:
//  - Converting code to PickListOption:  'yes' => { code: 'yes', label: 'Yes', groupLabel: 'Something' }
//  - Filling in initialSelected option:   null => { code: 'foo', label: 'The Initial Value', initialSelected: true }
//
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
    Object.values(itemMap || {}).forEach((item) => {
      if (!item.pickListOptions && !item.pickListReference) return; // nothing to enrich if no pick list

      const enrichedOptionValue = getEnrichedValueForChoiceItem({
        item,
        defaultValue: clonedValues[item.linkId],
        remotePickListMap: picklistValues,
        handleError,
      });

      if (enrichedOptionValue) clonedValues[item.linkId] = enrichedOptionValue;
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
