import { ReactNode } from 'react';

import InputGroupWithSummary from './group/InputGroupWithSummary';
import ItemGroup from './group/ItemGroup';

import { Component, FormItem } from '@/types/gqlTypes';

export interface GroupItemComponentProps {
  item: FormItem;
  nestingLevel: number;
  renderChildItem: (item: FormItem) => ReactNode;
  values: Record<string, any>;
  itemChanged: (linkId: string, value: any) => void;
  severalItemsChanged: (values: Record<string, any>) => void;
}

const DynamicGroup = (props: GroupItemComponentProps) => {
  switch (props.item.component) {
    case Component.InputGroup:
      return <InputGroupWithSummary key={props.item.linkId} {...props} />;
    default:
      return <ItemGroup key={props.item.linkId} {...props} />;
  }
};

export default DynamicGroup;
