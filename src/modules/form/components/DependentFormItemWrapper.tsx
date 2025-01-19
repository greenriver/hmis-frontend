import React, { ReactNode } from 'react';

import { useDynamicFieldAutofillSync } from '@/modules/form/hooks/rhf/useDynamicFieldAutofillSync';
import { useDynamicFieldStatus } from '@/modules/form/hooks/rhf/useDynamicFieldStatus';
import { FormItem } from '@/types/gqlTypes';

export interface Props {
  item: FormItem;
  renderChild: (disabled: boolean) => ReactNode;
}

/**
 * A wrapper component that manages conditional status for form items as well as auto filled values
 */
const DependentFormItemWrapper: React.FC<Props> = ({ item, renderChild }) => {
  const { visible, disabled } = useDynamicFieldStatus(item);
  useDynamicFieldAutofillSync(item);

  if (visible) return renderChild(disabled);
  return null;
};

export default DependentFormItemWrapper;
