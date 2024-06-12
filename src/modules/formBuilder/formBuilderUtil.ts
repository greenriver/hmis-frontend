import { cloneDeep, kebabCase } from 'lodash-es';
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
