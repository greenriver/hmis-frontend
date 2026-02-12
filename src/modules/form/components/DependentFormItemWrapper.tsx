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
 * A wrapper component that manages conditional status for form items as well as auto filled values.
 *
 * It's important that the autofill sync runs for all items, even if they are not visible, so that
 * autofill/initial values can be set on always-hidden calculated field (like LOS Under Threshold)
 */
const DependentFormItemWrapper: React.FC<Props> = ({ item, renderChild }) => {
  const { unregister, register } = useFormContext();
  const { visible, disabled } = useDynamicFieldStatus(item);
  useDynamicFieldAutofillSync(item);

  // Unregister disabled item, unless it's configured as "disabled_display: PROTECTED_WITH_VALUE"
  // which indicates that the field value should remain even when it is disabled.
  useEffect(() => {
    if (
      disabled &&
      item.disabledDisplay !== DisabledDisplay.ProtectedWithValue
    ) {
      unregister(item.linkId);
    } else {
      register(item.linkId);
    }
    return () => {
      unregister(item.linkId);
    };
  }, [
    disabled,
    visible,
    unregister,
    register,
    item.disabledDisplay,
    item.linkId,
  ]);

  if (visible) return renderChild(disabled);
  return null;
};

export default DependentFormItemWrapper;
