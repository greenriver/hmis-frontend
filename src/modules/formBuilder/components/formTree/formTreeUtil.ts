import { FormDefinitionJson, FormItem } from '@/types/gqlTypes';

export type FormItemForTree = FormItem & { children: FormItemForTree[] };

export const getItemsForTree = (definition: FormDefinitionJson) => {
  if (!definition) return [];

  // TODO(#6084): Consolidate functional groups that shouldn't appear as nested in the UI, like SSN
  function recur(items: FormItem[]): FormItemForTree[] {
    const newItems: FormItemForTree[] = [];

    items.forEach((item: FormItem) => {
      let children: FormItemForTree[] = [];
      if (Array.isArray(item.item)) {
        children = recur(item.item);
      }
      newItems.push({ ...item, children });
    });

    return newItems;
  }

  return recur(definition.item);
};

export const getItemFromTree = (item: FormItemForTree): FormItem => {
  const { children, ...rest } = item;
  return rest;
};
