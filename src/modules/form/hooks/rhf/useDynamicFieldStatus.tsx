import { isEmpty, uniq } from 'lodash-es';
import { useMemo } from 'react';
import { useDynamicFormWatchValues } from '@/modules/form/hooks/rhf/useDynamicFormWatchValues';
import useDynamicFormContext from '@/modules/form/hooks/useDynamicFormContext';
import {
  getAllChildLinkIds,
  shouldEnableItem,
} from '@/modules/form/util/formUtil';
import { DisabledDisplay, FormItem } from '@/types/gqlTypes';

interface FieldStatus {
  visible: boolean;
  disabled: boolean;
}

/**
 * Computes the status of a field
 * result.disabled is evaluated from the item's enableWhen configuration
 * result.hidden is evaluated by:
 * 1  The item is configured to be hidden
 * 2. The item is disabled and configured to be hidden when disabled
 * 3. All of the items children are hidden (they are disabled and configured to be hidden when disabled
 *
 * Attempts to isolate re-renders by watching only the items dependencies and those of the child items
 *
 */
export const useDynamicFieldStatus = (item: FormItem): FieldStatus => {
  const { linkId } = item;

  const { itemMap, disabledDependencyMap, localConstants } =
    useDynamicFormContext();

  const childIds = useMemo(() => {
    return getAllChildLinkIds(item, { onlyQuestions: false });
  }, [item]);

  const childDependencyIds = useMemo(() => {
    return childIds
      .filter((id) => itemMap[id].enableWhen)
      .flatMap((id) => disabledDependencyMap[id] || []);
  }, [childIds, itemMap, disabledDependencyMap]);

  const dependentIds = useMemo(
    () =>
      uniq([...childDependencyIds, ...(disabledDependencyMap[linkId] || [])]),
    [childDependencyIds, linkId, disabledDependencyMap]
  );

  const dependentValues = useDynamicFormWatchValues(dependentIds);

  const isDisabled = useMemo(() => {
    return !shouldEnableItem({
      item,
      itemMap,
      localConstants,
      values: dependentValues,
    });
  }, [dependentValues, localConstants, item, itemMap]);

  const visible = useMemo<boolean>(() => {
    if (item.hidden) return false;

    if (isDisabled && item.disabledDisplay === DisabledDisplay.Hidden)
      return false;

    if (isEmpty(dependentValues)) return true;

    const isChildVisible = (id: string) => {
      const child = itemMap[id];
      if (child.hidden) return false;
      if (child.disabledDisplay !== DisabledDisplay.Hidden) return true;

      const result = shouldEnableItem({
        item: child,
        itemMap,
        localConstants,
        values: dependentValues,
      });
      return result;
    };
    return childIds.some(isChildVisible);
  }, [childIds, dependentValues, isDisabled, item, itemMap, localConstants]);

  const result = {
    visible,
    disabled: isDisabled,
  };
  return result;
};
