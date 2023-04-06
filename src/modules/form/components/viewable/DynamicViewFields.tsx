import React, { ReactNode } from 'react';

import {
  OverrideableDynamicFieldProps,
  FormValues,
  ItemMap,
  LinkIdMap,
} from '../../types';

import DynamicField from './DynamicViewField';
import DynamicViewGroup from './DynamicViewGroup';

import {
  DisabledDisplay,
  FormDefinitionJson,
  FormItem,
  ItemType,
  ServiceDetailType,
  ValidationError,
} from '@/types/gqlTypes';

export interface Props {
  definition: FormDefinitionJson;
  errors?: ValidationError[];
  warnings?: ValidationError[];
  horizontal?: boolean;
  bulk?: boolean;
  pickListRelationId?: string;
  values: FormValues;
  itemMap: ItemMap;
  autofillDependencyMap: LinkIdMap;
  enabledDependencyMap: LinkIdMap;
  disabledLinkIds: string[];
}

export const isEnabled = (
  item: FormItem,
  disabledLinkIds: string[] = []
): boolean => {
  if (item.hidden) return false;
  if (!item.enableWhen && item.item) {
    // This is a group. Only show it if some children are enabled.
    return item.item.some((i) => isEnabled(i, disabledLinkIds));
  }
  // console.log({disabledLinkIds})
  return !disabledLinkIds.includes(item.linkId);
};

export const isShown = (item: FormItem, disabledLinkIds: string[] = []) => {
  if (
    !isEnabled(item, disabledLinkIds) &&
    item.disabledDisplay !== DisabledDisplay.Protected
  )
    return false;

  return true;
};

const DynamicViewFields: React.FC<Props> = ({
  definition,
  bulk,
  // itemMap,
  // autofillDependencyMap, // { linkId => array of Link IDs that depend on it for autofill }
  // enabledDependencyMap, // { linkId => array of Link IDs that depend on it for enabled status }
  horizontal = false,
  pickListRelationId,
  values,
  disabledLinkIds,
}) => {
  // Recursively render an item
  const renderItem = (
    item: FormItem,
    nestingLevel: number,
    props?: OverrideableDynamicFieldProps,
    renderFn?: (children: ReactNode) => ReactNode
  ) => {
    const isDisabled = !isEnabled(item, disabledLinkIds);
    if (isDisabled && item.disabledDisplay !== DisabledDisplay.Protected)
      return null;
    if (bulk && item.serviceDetailType === ServiceDetailType.Client)
      return null;

    if (item.type === ItemType.Group) {
      return (
        <DynamicViewGroup
          item={item}
          key={item.linkId}
          nestingLevel={nestingLevel}
          renderChildItem={(item, props, fn) =>
            renderItem(item, nestingLevel + 1, props, fn)
          }
          values={values}
        />
      );
    }

    const itemComponent = (
      <DynamicField
        key={item.linkId}
        item={item}
        value={isDisabled ? undefined : values[item.linkId]}
        nestingLevel={nestingLevel}
        horizontal={horizontal}
        pickListRelationId={pickListRelationId}
        {...props}
      />
    );
    if (renderFn) {
      return renderFn(itemComponent);
    }
    return itemComponent;
  };

  return <>{definition.item.map((item) => renderItem(item, 0))}</>;
};

export default DynamicViewFields;
