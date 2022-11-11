import { ReactNode } from 'react';

import ItemGroup from './group/ItemGroup';
import NumericInputGroup from './group/NumericInputGroup';

import { Component, FormItem } from '@/types/gqlTypes';

export interface GroupItemComponentProps {
  item: FormItem;
  nestingLevel: number;
  renderChildItem?: (item: FormItem) => ReactNode;
  values: Record<string, any>;
}

const DynamicGroup = (props: GroupItemComponentProps) => {
  switch (props.item.component) {
    case Component.CheckboxGroup:
      return <ItemGroup key={props.item.linkId} {...props} />;
    case Component.NumericGroup:
      return <NumericInputGroup key={props.item.linkId} {...props} />;
    default:
      return <ItemGroup key={props.item.linkId} {...props} />;
  }
};

export default DynamicGroup;
