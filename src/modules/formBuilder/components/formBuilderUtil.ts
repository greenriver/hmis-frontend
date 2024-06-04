import { ItemType, Component } from '@/types/gqlTypes';

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
