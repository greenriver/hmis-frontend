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
  const { unregister } = useFormContext();
  const { visible, disabled } = useDynamicFieldStatus(item);
  useDynamicFieldAutofillSync(item);

  // Unregisted disabled item _unless_ it's configured as "disabled_display: PROTECTED_WITH_VALUE"
  // which indicates that the field value should remain even when it is disabled.
  useEffect(() => {
    if (
      disabled &&
      item.disabledDisplay !== DisabledDisplay.ProtectedWithValue
    ) {
      unregister(item.linkId);
    }
  }, [disabled, visible, unregister, item]);

  if (visible) return renderChild(disabled);
  return null;
};

export default DependentFormItemWrapper;
