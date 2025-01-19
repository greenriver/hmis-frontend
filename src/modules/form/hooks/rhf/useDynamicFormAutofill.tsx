import { useMemo } from 'react';
import { useDynamicFormWatchValues } from '@/modules/form/hooks/rhf/useDynamicFormWatchValues';
import useDynamicFormContext from '@/modules/form/hooks/useDynamicFormContext';
import { autofillValues } from '@/modules/form/util/formUtil';
import { FormItem, ItemType } from '@/types/gqlTypes';

export const useDynamicFormAutofill = (item: FormItem) => {
  const { itemMap, localConstants, viewOnly, autofillInvertedDependencyMap } =
    useDynamicFormContext();
  const values = useDynamicFormWatchValues(
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
      (item.readOnly || item.type === ItemType.Display) &&
      !viewOnly
    ) {
      return { value: null };
    }

    return result;
  }, [item, values, itemMap, localConstants, viewOnly]);
};
