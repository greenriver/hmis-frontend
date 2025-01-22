import React, { ReactNode, useEffect } from 'react';

import { useFormContext } from 'react-hook-form';
import { useDynamicFieldAutofillSync } from '@/modules/form/hooks/rhf/useDynamicFieldAutofillSync';
import { useDynamicFieldStatus } from '@/modules/form/hooks/rhf/useDynamicFieldStatus';
import { DisabledDisplay, FormItem } from '@/types/gqlTypes';

export interface Props {
  item: FormItem;
  renderChild: (disabled: boolean) => ReactNode;
}

/**
 * A wrapper component that manages conditional status for form items as well as auto filled values
 */
const DependentFormItemWrapper: React.FC<Props> = ({ item, renderChild }) => {
  const { setValue } = useFormContext();
  const { visible, disabled } = useDynamicFieldStatus(item);
  useDynamicFieldAutofillSync(item);

  // If this item is disabled and has a "protected" display, clear the value for this field
  // (For DisabledDisplay.Hidden, it's cleared automatically when the input is unregistered.)
  // (For DisabledDisplay.ProtectedWithValue, the value intentionally remains when the item is disabled.)
  useEffect(() => {
    if (
      disabled &&
      visible &&
      item.disabledDisplay === DisabledDisplay.Protected
    ) {
      setValue(item.linkId, null);
    }
  }, [disabled, visible, setValue, item]);

  if (visible) return renderChild(disabled);
  return null;
};

export default DependentFormItemWrapper;
