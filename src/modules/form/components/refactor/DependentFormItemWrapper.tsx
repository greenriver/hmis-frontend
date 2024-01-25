import React, { ReactNode, useMemo } from 'react';
import { useWatch } from 'react-hook-form';

import {
  FormDefinitionHandlers,
  getSafeLinkId,
} from './useFormDefinitionHandlers';
import { DisabledDisplay, FormItem } from '@/types/gqlTypes';

export interface Props {
  handlers: FormDefinitionHandlers;
  item: FormItem;
  children: (isDisabled: boolean) => ReactNode;
}

const DependentFormItemWrapper: React.FC<Props> = ({
  handlers,
  item,
  children,
}) => {
  const { disabledDependencyMap, isItemDisabled } = handlers;

  const name = useMemo(() => {
    const list: string[] = [
      // All of this component's dependencies
      ...(disabledDependencyMap[item.linkId] || []),
      // All of this component's direct children
      ...(item.item
        ?.filter((item) => item.enableWhen)
        ?.map((item) => item.linkId) || []),
    ];

    return list.map(getSafeLinkId);
  }, [item, disabledDependencyMap]);

  // Listen for dependent field value changes
  useWatch({
    control: handlers.methods.control,
    name,
  });

  const isDisabled = isItemDisabled(item);

  // Hide if this item should be disabled
  if (isDisabled && item.disabledDisplay === DisabledDisplay.Hidden)
    return null;
  // Hide if all of this item's children are disabled
  if (
    item.item?.every(
      (child) =>
        isItemDisabled(child) &&
        child.disabledDisplay === DisabledDisplay.Hidden
    )
  )
    return null;

  return <>{children(isDisabled)}</>;
};

export default DependentFormItemWrapper;
