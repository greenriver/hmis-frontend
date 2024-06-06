import { cloneDeep, kebabCase } from 'lodash-es';
import {
  ItemType,
  Component,
  FormDefinitionJson,
  FormItem,
  Maybe,
} from '@/types/gqlTypes';

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

function moveIntoGroup(
  itemToMove: FormItem,
  group: FormItem,
  addMethod: 'push' | 'unshift',
  thisLayer: FormItem[],
  currentIndex: number
) {
  if (!group.item) group.item = [];
  group.item[addMethod](itemToMove);
  thisLayer.splice(currentIndex, 1);
  return true;
}

function swapItems(index1: number, index2: number, thisLayer: FormItem[]) {
  [thisLayer[index1], thisLayer[index2]] = [
    thisLayer[index2],
    thisLayer[index1],
  ];
  return true;
}

function moveToParent(
  itemToMove: FormItem,
  parentLayer: FormItem[],
  newIndex: number,
  thisLayer: FormItem[],
  currentIndex: number
) {
  parentLayer.splice(newIndex, 0, itemToMove);
  thisLayer.splice(currentIndex, 1);
  return true;
}

export const reorderFormItems = (
  formDefinition: FormDefinitionJson,
  itemToMove: FormItem,
  direction: 'up' | 'down'
) => {
  const copy = cloneDeep(formDefinition);
  const toExpand: string[] = [];

  function recurseFindAndMove(
    thisLayer: Maybe<FormItem[]> | undefined,
    parentLayer: Maybe<FormItem[]> | undefined,
    indexInParent: number,
    nestingDepth: number
  ): boolean {
    if (!thisLayer) return false;

    const currentIndex = thisLayer.findIndex(
      (i) => i.linkId === itemToMove.linkId
    );

    if (currentIndex >= 0) {
      // Found the item in this layer
      if (direction === 'up') {
        if (currentIndex > 0) {
          // This item isn't the first item in the list
          const prevItem = thisLayer[currentIndex - 1];

          if (prevItem.type === ItemType.Group && nestingDepth < 5) {
            toExpand.push(prevItem.linkId);
            // If the previous item is a group, and we haven't reached max nesting depth, then move it into the group
            return moveIntoGroup(
              itemToMove,
              prevItem,
              'push',
              thisLayer,
              currentIndex
            );
          } else {
            // Otherwise, simply swap it with the previous item
            return swapItems(currentIndex, currentIndex - 1, thisLayer);
          }
        }
        // If this is the first item in the list, and there's no parent layer, then we have nothing to do
        if (!parentLayer) return false;
        // If this is the first item in the current layer, but there is a parent, then move up into the parent.
        return moveToParent(
          itemToMove,
          parentLayer,
          indexInParent,
          thisLayer,
          currentIndex
        );
      }

      if (direction === 'down') {
        if (currentIndex < thisLayer.length - 1) {
          const nextItem = thisLayer[currentIndex + 1];

          if (nextItem.type === ItemType.Group && nestingDepth < 5) {
            toExpand.push(nextItem.linkId);
            return moveIntoGroup(
              itemToMove,
              nextItem,
              'unshift',
              thisLayer,
              currentIndex
            );
          } else {
            return swapItems(currentIndex, currentIndex + 1, thisLayer);
          }
        }
        if (!parentLayer) return false;
        return moveToParent(
          itemToMove,
          parentLayer,
          indexInParent + 1,
          thisLayer,
          currentIndex
        );
      }
    }

    // Didn't find the item in this layer; recurse through the child layers
    for (let i = 0; i < thisLayer.length; i++) {
      if (
        recurseFindAndMove(thisLayer[i].item, thisLayer, i, nestingDepth + 1)
      ) {
        return true; // Early return if element is found in recursion
      }
    }

    return false;
  }

  recurseFindAndMove(copy.item, undefined, -1, 1);
  return { definition: copy, toExpand };
};

export const slugifyItemLabel = (label: string) => {
  return kebabCase(label).toLowerCase().replace(/-/g, '_').slice(0, 40);
};
