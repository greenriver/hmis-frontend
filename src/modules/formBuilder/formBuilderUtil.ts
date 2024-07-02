import { cloneDeep, get, kebabCase, set } from 'lodash-es';
import { ItemMap } from '@/modules/form/types';
import {
  buildAutofillDependencyMap,
  buildBoundsDependencyMap,
  buildEnabledDependencyMap,
} from '@/modules/form/util/formUtil';
import { ItemDependents } from '@/modules/formBuilder/types';
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
export const determineAutofillField = (itemType: ItemType) => {
  switch (itemType) {
    case ItemType.Boolean:
      return 'valueBoolean';
    case ItemType.Choice:
    case ItemType.OpenChoice:
    case ItemType.String:
    case ItemType.Text:
      return 'valueCode';
    case ItemType.Integer:
    case ItemType.Currency:
      return 'valueNumber';
    default:
      // other item types do not yet supports autofilling (e.g. Dates)
      return;
  }
};
export const determineInitialValueField = (itemType: ItemType) => {
  switch (itemType) {
    case ItemType.Boolean:
      return 'valueBoolean';
    case ItemType.Choice:
    case ItemType.OpenChoice:
    case ItemType.String:
    case ItemType.Text:
      return 'valueCode';
    case ItemType.Integer:
    case ItemType.Currency:
      return 'valueNumber';
    default:
      return;
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
export const getRhfPathMap = (items: FormItem[]) => {
  const map: Record<string, string> = {};

  function recursiveMap(
    items: Maybe<FormItem[]> | undefined,
    parentKey: string
  ) {
    items?.forEach((item, i) => {
      const key = `${parentKey && parentKey + '.'}${i}`;

      map[item.linkId] = key;
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
  if (!newParentArray) {
    // If array doesn't exist, this might be a new Group item that doesn't have children yet.
    // Raise unless its a Group item.
    const parentItem = get(definition, insertPath.replace(/\.item$/, ''));
    if (!parentItem || parentItem.type !== ItemType.Group) {
      throw new Error('Can only insert item into a Group item');
    }
    // Insert the item into a new array
    set(definition, insertPath, [item]);
  } else {
    // Insert the item
    newParentArray.splice(insertAtIndex, 0, item);
  }
};

/**
 * Given a linkId, returns all other form items that depend on that linkId,
 * organized by the reason for the dependence (autofill, bounds, or enableWhen).
 * Deletion is only valid on items that have no dependents, so this function
 * is used for validating that a deletion action is allowed.
 *
 * @param linkId the linkId of the item to check for dependencies
 * @param itemMap the map of linkId => item in the current form
 */
export const getDependentItems = ({
  linkId,
  itemMap,
}: {
  linkId: string;
  itemMap: ItemMap;
}): ItemDependents => {
  const autofillDependencyMap = buildAutofillDependencyMap(itemMap);
  const enableWhenDependencyMap = buildEnabledDependencyMap(itemMap);
  const boundDependencyMap = buildBoundsDependencyMap(itemMap);

  return {
    autofillDependents:
      autofillDependencyMap[linkId]?.map((dependerId) => itemMap[dependerId]) ||
      [],
    enableWhenDependents:
      enableWhenDependencyMap[linkId]?.map(
        (dependerId) => itemMap[dependerId]
      ) || [],
    boundDependents:
      boundDependencyMap[linkId]?.map((dependerId) => itemMap[dependerId]) ||
      [],
  };
};

/**
 * Given the form items, generates a map of linkIds to a list of all their
 * ancestor linkIds in the form's nested structure, in order.
 * For example, if the form structure is something like:
 * item: {
 *   linkId: grandparent,
 *   type: group,
 *   item: [
 *     {
 *       linkId: parent,
 *       type: group,
 *       item: [
 *         { linkId: child }
 *       ]
 *     }
 *   ]
 * }
 *
 * then this ancestorLinkIdMap will look like:
 * {
 *   grandparent: [],
 *   parent: [grandparent],
 *   child: [grandparent, parent]
 * }
 */
export const getAncestorLinkIdMap = (items: FormItem[]) => {
  const map: Record<string, string[]> = {};

  function recursiveMap(
    items: Maybe<FormItem[]> | undefined,
    ancestors: string[]
  ) {
    items?.forEach((item) => {
      map[item.linkId] = ancestors;
      recursiveMap(item.item, [...ancestors, item.linkId]);
    });
  }

  recursiveMap(items, []);
  return map;
};

export type ItemCategory = 'question' | 'display' | 'group';
export const getItemCategory = (itemTypeValue: ItemType): ItemCategory => {
  switch (itemTypeValue) {
    case ItemType.Display:
      return 'display';
    case ItemType.Group:
      return 'group';
    default:
      return 'question';
  }
};
export const COMPARABLE_ITEM_TYPES = [
  ItemType.Integer,
  ItemType.Currency,
  ItemType.Date,
];
