import { sample, sampleSize } from 'lodash-es';
import { isHmisEnum, FormValues } from '@/modules/form/types';
import { localResolvePickList, getItemMap } from '@/modules/form/util/formUtil';
import { FormItem, ItemType, FormDefinitionJson } from '@/types/gqlTypes';

const mockValueForItem = (item: FormItem) => {
  switch (item.type) {
    case ItemType.Boolean:
      return sample([true, false, null]);
    case ItemType.String:
      return sample(['Otis', 'Jeremy', 'Green', 'Purple']);
    case ItemType.Integer:
      return sample([0, 50, 100]);
    case ItemType.Currency:
      return sample([0, 50.0, 100.25]);
    case ItemType.Date:
      return new Date();
    case ItemType.Text:
      return 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.';
    case ItemType.Choice:
      if (item.pickListOptions) return sample(item.pickListOptions);
      if (item.pickListReference && isHmisEnum(item.pickListReference)) {
        const options = localResolvePickList(item.pickListReference);
        if (item.repeats) return sampleSize(options, 2);
        return sample(options);
      }
      return { code: 'option-1', label: 'Selected Option' };
    default:
      return null;
  }
};
export const generateMockValuesForFromDefinition = (
  definition: FormDefinitionJson
) => {
  const itemMap = getItemMap(definition, false);
  const values: FormValues = {};
  Object.values(itemMap).forEach((item) => {
    values[item.linkId] = mockValueForItem(item);
  });
  return values;
};
