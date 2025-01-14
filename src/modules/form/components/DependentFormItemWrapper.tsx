import { compact, flattenDeep, uniq } from 'lodash-es';
import React, { ReactNode, useMemo } from 'react';
import { useWatch } from 'react-hook-form';

import {
  FormDefinitionHandlers,
  getSafeLinkId,
} from '../hooks/useFormDefinitionHandlers';
import { getAllChildLinkIds } from '../util/formUtil';
import { DisabledDisplay, FormItem } from '@/types/gqlTypes';

export interface Props {
  handlers: FormDefinitionHandlers;
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
const DependentFormItemWrapper: React.FC<Props> = ({
  handlers,
  item,
  children,
}) => {
  const { linkId } = item;
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

  /**
   * Computes the list of all link IDs that affect the enabled/disabled state of this item
   * and its children. This includes:
   * 1. Direct dependencies of this item
   * 2. Dependencies of all child items that have enableWhen conditions
   */
  const dependentLinkIds = useMemo(() => {
    const list: string[] = [
      // All of this component's dependencies
      ...(disabledDependencyMap[linkId] || []),
      // All of this component's children
      ...flattenDeep(
        childItems
          ?.filter((item) => item.enableWhen)
          ?.map((item) => disabledDependencyMap[item.linkId] || []) || []
      ),
    ];

    return uniq(list.map(getSafeLinkId));
  }, [linkId, childItems, disabledDependencyMap]);

  // Listen for dependent field value changes
  const dependantValues = useWatch({
    control: handlers.methods.control,
    name: dependentLinkIds,
  });

  const [isDisabled] = useMemo(
    () => [isItemDisabled(item), dependantValues],
    [isItemDisabled, item, dependantValues]
  );

  /**
   * Determines if the item should be hidden based on:
   * 1. If the item is disabled and configured to be hidden when disabled
   * 2. If all child items are disabled and configured to be hidden when disabled
   */
  const [hidden] = useMemo<[boolean, any]>(() => {
    // Hide if this item should be disabled
    if (isDisabled && item.disabledDisplay === DisabledDisplay.Hidden)
      return [true, null];

    // Hide if all of this item's children are disabled
    if (childItems.length === 0) return [false, null];
    const childrenHidden = childItems.every(
      (child) =>
        isItemDisabled(child) &&
        child.disabledDisplay === DisabledDisplay.Hidden
    );
    return [childrenHidden, dependantValues];
  }, [
    isDisabled,
    item.disabledDisplay,
    isItemDisabled,
    childItems,
    dependantValues,
  ]);

  if (hidden) return null;

  return <>{children(isDisabled)}</>;
};

export default DependentFormItemWrapper;
