import React, { ReactNode } from 'react';

import { useDynamicFieldStatus } from '@/modules/form/hooks/rhf/useDynamicFieldStatus';
import { FormItem } from '@/types/gqlTypes';

export interface Props {
  item: FormItem;
  children: (isDisabled: boolean) => ReactNode;
}

/**
 * A wrapper component that manages conditional display and disable states for form items
 * and their children based on form dependencies.
 *
 * This component:
 * - Tracks dependencies between form fields that affect enabled/disabled states
 * - Listens for changes to dependent field values
 * - Manages visibility based on disabled state and display rules
 * - Handles nested item dependencies
 */
const DependentFormItemWrapper: React.FC<Props> = ({ item, children }) => {
  const { visible, disabled } = useDynamicFieldStatus(item);

  if (visible) return children(disabled);
  return null;
};

export default DependentFormItemWrapper;
