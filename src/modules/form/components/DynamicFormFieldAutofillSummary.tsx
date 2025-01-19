import React from 'react';

import { useDynamicFieldAutofillSync } from '@/modules/form/hooks/rhf/useDynamicFieldAutofillSync';
import { formatCurrency } from '@/modules/hmis/hmisUtil';
import { FormItem } from '@/types/gqlTypes';

export interface Props {
  item: FormItem;
  isCurrency: boolean;
}

const DynamicFormFieldAutofillSummary: React.FC<Props> = ({
  item,
  isCurrency,
}) => {
  const result = useDynamicFieldAutofillSync(item);

  let value = 0;
  if (result?.value) {
    value = isCurrency ? formatCurrency(result.value) : value;
  }
  return <>{value}</>;
};

export default DynamicFormFieldAutofillSummary;
