import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import useDynamicFormContext from '@/modules/form/hooks/useDynamicFormContext';
import { transformSubmitValues } from '@/modules/form/util/formUtil';

// Dev helper for debugging form state for as set of items.
// Prints values as they are in state, and values after transformSubmitValues (which should match how they will be submitted)
export const useDebugDynamicFormValues = (linkIds: string[]) => {
  const { definition } = useDynamicFormContext();
  const { getValues } = useFormContext();

  const consoleDebugValues = useCallback(() => {
    if (import.meta.env.MODE !== 'development') {
      return;
    }

    const childValueArr = getValues(linkIds);
    const childValueMap = Object.fromEntries(
      linkIds.map((linkId, idx) => [linkId, childValueArr[idx]])
    );

    const valuesByKey = transformSubmitValues({
      definition,
      values: childValueMap,
      keyByFieldName: true,
    });
    // eslint-disable-next-line no-console
    console.group('Form Debug Values:');
    // eslint-disable-next-line no-console
    console.log(childValueMap);
    // eslint-disable-next-line no-console
    console.log(valuesByKey);
    // eslint-disable-next-line no-console
    console.groupEnd();
  }, [definition, getValues, linkIds]);

  return consoleDebugValues;
};
