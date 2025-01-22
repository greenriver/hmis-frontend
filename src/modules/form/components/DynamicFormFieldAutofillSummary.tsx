import React, { useMemo } from 'react';

import { useFormContext } from 'react-hook-form';
import { useDynamicFieldAutofillSync } from '@/modules/form/hooks/rhf/useDynamicFieldAutofillSync';
import { formatCurrency } from '@/modules/hmis/hmisUtil';
import { FormItem } from '@/types/gqlTypes';

export interface Props {
  item: FormItem;
  isCurrency: boolean;
}

/**
 * Component for rendering the optional "summary item" at the end of a from Group that uses the INPUT_GROUP component.
 * An item is considered a "summary item" if it has type:DISPLAY, and is the last item in the input group.
 *
 * All this really does it implement the currency formatting. If we had a better way to do that for display items,
 * we might be able to remove this component and use standard dynamic rendering for this item. (eg `renderChild` from InputGroup)
 *
 * Usage notes:
 *
 * - Income And Sources: The last item in the group is a summary item that displays the total monthly income.
 * When rendered in edit-mode, the total income is autofilled. When rendered in view-mode, it is NOT auto-filled.
 * (This is configured in the form item with 'autofill_readonly')
 *
 * - Inventory Bed Inventory: The last item in the group is a summary item that displays the total bed count.
 */
const DynamicFormFieldAutofillSummary: React.FC<Props> = ({
  item,
  isCurrency,
}) => {
  const autofillValue = useDynamicFieldAutofillSync(item);
  const { getValues } = useFormContext();

  const formattedValue = useMemo(() => {
    let value = getValues(item.linkId);
    if (autofillValue) value = autofillValue.value;
    if (isCurrency) value = formatCurrency(value);

    return value;
  }, [autofillValue, getValues, isCurrency, item.linkId]);

  return <>{formattedValue}</>;
};

export default DynamicFormFieldAutofillSummary;
