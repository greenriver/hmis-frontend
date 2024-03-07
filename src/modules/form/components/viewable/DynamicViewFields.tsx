import React, { ReactNode } from 'react';

import {
  FormValues,
  ItemChangedFn,
  ItemMap,
  OverrideableDynamicFieldProps,
  PickListArgs,
} from '../../types';
import { isEnabled } from '../../util/formUtil';

import DynamicViewGroup from './DynamicViewGroup';

import DynamicViewItem from '@/modules/form/components/viewable/DynamicViewItem';
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
  visible?: boolean;
  pickListArgs?: PickListArgs;
  values: FormValues;
  itemChanged: ItemChangedFn;
  itemMap: ItemMap;
  disabledLinkIds: string[];
}

const DynamicViewFields: React.FC<Props> = ({
  definition,
  bulk,
  itemMap,
  horizontal = false,
  pickListArgs,
  values,
  disabledLinkIds,
  itemChanged,
  ...fieldsProps
}) => {
  // Recursively render an item
  const renderItem = (
    item: FormItem,
    nestingLevel: number,
    props?: OverrideableDynamicFieldProps,
    renderFn?: (children: ReactNode) => ReactNode
  ) => {
    const isDisabled = !isEnabled(item, disabledLinkIds);
    if (isDisabled && item.disabledDisplay === DisabledDisplay.Hidden)
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
          {...fieldsProps}
        />
      );
    }

    return (
      <DynamicViewItem
        key={item.linkId}
        item={item}
        isDisabled={isDisabled}
        horizontal={horizontal}
        nestingLevel={nestingLevel}
        values={values}
        renderFn={renderFn}
        pickListArgs={pickListArgs}
        itemChanged={itemChanged}
      />
    );
  };

  return <>{definition.item.map((item) => renderItem(item, 0))}</>;
};

export default DynamicViewFields;
