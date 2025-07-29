import { useMemo } from 'react';
import { useDynamicFieldWatchValues } from '@/modules/form/hooks/rhf/useDynamicFieldWatchValues';
import useDynamicFormContext from '@/modules/form/hooks/useDynamicFormContext';
import { autofillValues } from '@/modules/form/util/formUtil';
import { FormItem, ItemType } from '@/types/gqlTypes';

interface AutoFillValueResult {
  value: any;
}
export const useDynamicFieldAutofillValue = (
  item: FormItem
): AutoFillValueResult | null => {
  const { itemMap, localConstants, viewOnly, autofillInvertedDependencyMap } =
    useDynamicFormContext();
  const values = useDynamicFieldWatchValues(
    autofillInvertedDependencyMap[item.linkId]
  );

  return useMemo(() => {
    const result = autofillValues({
      item,
      values,
      itemMap,
      localConstants,
      viewOnly,
    });

    /**
     For read-only items that are displayed on editable forms, the autofill value should nullify when its conditions are no longer met.
     For example, a read-only field showing the sum of 2 input fields should be cleared if the inputs are cleared.
    (In that example, we assume the autofill rule for summing has an autofill_when condition requiring the inputs to be present)
    **/
    if (
      !result &&
      !!item.autofillValues &&
      (item.readOnly || item.type === ItemType.Display) &&
      !viewOnly
    ) {
      return { value: null };
    }

    return result;
  }, [item, values, itemMap, localConstants, viewOnly]);
};
