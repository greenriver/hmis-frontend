import { ItemMap } from '../form/types';
import { PickListOption } from '@/types/gqlTypes';

export const generateItemPickList = (
  itemMap: ItemMap,
  exclude: string[] = []
) => {
  const pickList: PickListOption[] = [];
  Object.values(itemMap).forEach((item) => {
    if (exclude.includes(item.linkId)) return;

    let label = item.briefText || item.text || item.linkId;
    // ellipsize long labels
    if (label.length > 50) label = label.substring(0, 50) + '...';

    pickList.push({ code: item.linkId, label });
  });

  return pickList.sort(function (a, b) {
    return (a.label || a.code)
      .toLowerCase()
      .localeCompare((b.label || b.code).toLowerCase());
  });
};
