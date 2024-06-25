import { useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { FormItemControl } from '../types';
import { ItemMap } from '@/modules/form/types';
import { displayLabelForItem } from '@/modules/formBuilder/formBuilderUtil';
import { FormItem, PickListOption } from '@/types/gqlTypes';

// Generate a PickList of other items, with the current form's item excluded.
// Additional filtering can be applied with the filterItems function.
export function useItemPickList({
  control,
  itemMap,
  filterItems = () => true,
}: {
  control: FormItemControl;
  itemMap: ItemMap;
  filterItems?: (item: FormItem) => boolean;
}): PickListOption[] {
  // Link ID of the current item
  const currentLinkId = useWatch({ control, name: 'linkId' });
  // Generate pick list of other items
  const itemPickList = useMemo(() => {
    return Object.values(itemMap)
      .filter((item) => item.linkId !== currentLinkId && filterItems(item))
      .map((item) => ({ code: item.linkId, label: displayLabelForItem(item) }))
      .sort(function (a, b) {
        return (a.label || a.code)
          .toLowerCase()
          .localeCompare((b.label || b.code).toLowerCase());
      });
  }, [currentLinkId, filterItems, itemMap]);

  return itemPickList;
}
