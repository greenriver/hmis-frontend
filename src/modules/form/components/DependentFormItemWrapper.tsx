import { compact, flattenDeep, isEmpty } from 'lodash-es';
import React, { ReactNode, useMemo } from 'react';
import { useWatch } from 'react-hook-form';

import { getAllChildLinkIds } from '../util/formUtil';
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
  const { disabledDependencyMap, itemMap, isItemDisabled } = handlers;

  const childItems = useMemo(
    () =>
      compact(
        getAllChildLinkIds(item, { onlyQuestions: false }).map(
          (e) => itemMap[e]
        )
      ),
    [item, itemMap]
  );

  const name = useMemo(() => {
    const list: string[] = [
      // All of this component's dependencies
      ...(disabledDependencyMap[item.linkId] || []),
      // All of this component's children
      ...flattenDeep(
        childItems
          ?.filter((item) => item.enableWhen)
          ?.map((item) => disabledDependencyMap[item.linkId] || []) || []
      ),
    ];

    return list.map(getSafeLinkId);
  }, [item, childItems, disabledDependencyMap]);

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
    !isEmpty(childItems) &&
    childItems.every(
      (child) =>
        isItemDisabled(child) &&
        child.disabledDisplay === DisabledDisplay.Hidden
    )
  )
    return null;

  return <>{children(isDisabled)}</>;
};

export default DependentFormItemWrapper;
