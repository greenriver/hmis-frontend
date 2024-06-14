import { cloneDeep, get, kebabCase } from 'lodash-es';
import {
  Component,
  FormDefinitionJson,
  FormItem,
  ItemType,
  Maybe,
} from '@/types/gqlTypes';

// Strip basic HTML tags from a string. This is not fool-proof. This is used to strip tags from form labels and display text,
// so they can be shown as plain-text in the form builder.
export const removeHtmlTags = (value?: string | null): string => {
  if (!value) return '';

  return value.replace(/<[^>]*>/g, '');
};

export const displayLabelForItem = (item: FormItem, ellipsize = true) => {
  let label =
    item.readonlyText?.trim() ||
    item.briefText?.trim() ||
    removeHtmlTags(item.text)?.trim() ||
    item.linkId;

  // ellipsize long label
  if (ellipsize && label.length > 50) label = label.substring(0, 50) + '...';

  return label;
};

export const validComponentsForType = (type: ItemType) => {
  /**
   * You can select a component override for some item types, but each item type
   * also has a default component that it displays (Except for Object?).
   * These are specified in code in the DynamicField/DynamicViewField.
   */
  switch (type) {
    case ItemType.Object:
      return [
        Component.Address,
        Component.Phone,
        Component.Email,
        Component.Name,
      ];
    case ItemType.Display:
      return [
        Component.AlertInfo,
        Component.AlertWarning,
        Component.AlertSuccess,
        Component.AlertError,
      ];
    case ItemType.Boolean:
      return [Component.Checkbox];
    case ItemType.Choice:
      return [
        Component.Dropdown,
        Component.RadioButtons,
        Component.RadioButtonsVertical,
      ];
    case ItemType.Group:
      return [
        Component.HorizontalGroup,
        Component.InfoGroup,
        Component.InputGroup,
        Component.SignatureGroup,
        Component.Signature,
        Component.Table,
      ];
    case ItemType.Integer:
      return [Component.MinutesDuration];
    case ItemType.String:
    case ItemType.Text:
      return [Component.Phone, Component.Ssn];
    default:
      return [];
  }
};

export const updateFormItem = (
  formDefinition: FormDefinitionJson,
  newItem: FormItem,
  initialLinkId: string
) => {
  const copy = cloneDeep(formDefinition);

  function recursiveReplace(items: Maybe<FormItem[]> | undefined): boolean {
    if (!items) return false;

    const index = items.findIndex((i) => i.linkId === initialLinkId);

    if (index >= 0) {
      items[index] = newItem;
      return true; // Return true to stop further recursion
    }

    for (const item of items) {
      if (recursiveReplace(item.item)) {
        return true; // Early return if element is found in deeper recursion
      }
    }

    return false;
  }

  // Recurse through the item tree and replace the item
  if (!recursiveReplace(copy.item)) {
    // If recursiveReplace returns false, we didn't find the link ID, so this is a new element.
    copy.item = [...copy.item, newItem];
  }

  return copy;
};

export const slugifyItemLabel = (label: string) => {
  const cleanedLabel = removeHtmlTags(label);
  return kebabCase(cleanedLabel).toLowerCase().replace(/-/g, '_').slice(0, 40);
};

/**
 * Maps the item's linkId to the string key that React Hook Forms's useArrayFields hook expects,
 * which looks like: `item`, `item.0`, `item.0.item.1`, etc.
 */
export const getItemIdMap = (items: FormItem[]) => {
  const map: Record<string, string> = {};

  function recursiveMap(
    items: Maybe<FormItem[]> | undefined,
    parentKey: string
  ) {
    items?.forEach((item, i) => {
      const key = `${parentKey && parentKey + '.'}${i}`;
      // if (Array.isArray(item)) console.log('>>>', item);
      // if (!item.linkId) return;

      map[item.linkId] = key;
      // console.log(
      //   'chose index ',
      //   key,
      //   'for',
      //   item.linkId,
      //   '. parentKey was',
      //   parentKey
      // );
      recursiveMap(item.item, key + '.item');
    });
  }

  recursiveMap(items, 'item');
  return map;
};

/**
 * Helper fn for interacting with the form tree structure as stored in React Hook Forms,
 * which stores item paths like `item`, `item.0`, `item.0.item.1`, etc.
 * Given a form path, return the path to its parent and the index in the parent.
 * For example: if itemPath is `item.0.item.1`, then the parentPath is `item.0.item`
 * and the index is 1.
 */
export const getPathContext = (
  itemPath: string
): { parentPath: string; index: number } => {
  if (!itemPath || itemPath === 'item') {
    return { parentPath: '', index: -1 };
  }

  const components = itemPath.split('.');
  const lastComponent = components[components.length - 1];

  if (lastComponent !== 'item') {
    const index = components.pop();
    return {
      parentPath: components.join('.'),
      index: Number(index),
    };
  } else {
    throw new Error('shouldnt happen');
  }
};

// mutates definition
export const removeItemFromDefinition = ({
  removeFromPath,
  removeFromIndex,
  definition,
}: {
  removeFromPath: string;
  removeFromIndex: number;

  definition: FormDefinitionJson;
}) => {
  // Get the array
  const oldParentArray = get(definition, removeFromPath);
  // Drop the item at the specified index
  const itemRemoved = oldParentArray.splice(removeFromIndex, 1)[0];

  return itemRemoved;
};

// mutates definition
export const insertItemToDefinition = ({
  insertPath,
  insertAtIndex,
  definition,
  item,
}: {
  insertPath: string;
  insertAtIndex: number;
  definition: FormDefinitionJson;
  item?: FormItem;
}) => {
  // Get the array
  const newParentArray = get(definition, insertPath);
  // Insert the item
  return newParentArray.splice(insertAtIndex, 0, item);
};
