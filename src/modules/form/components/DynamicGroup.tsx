import { ReactNode } from 'react';

import { DynamicFieldProps } from './DynamicField';
import InputGroup from './group/InputGroup';
import ItemGroup from './group/ItemGroup';

import { Component, FormItem } from '@/types/gqlTypes';

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type OverrideableDynamicFieldProps = Optional<
  Omit<DynamicFieldProps, 'item' | 'value' | 'nestingLevel'>,
  'itemChanged' // allow groups to override item changed
>;

export interface GroupItemComponentProps {
  item: FormItem;
  nestingLevel: number;
  renderChildItem: (
    item: FormItem,
    props?: OverrideableDynamicFieldProps,
    renderFn?: (children: ReactNode) => ReactNode
  ) => ReactNode;
  values: Record<string, any>;
  itemChanged: (linkId: string, value: any) => void;
  severalItemsChanged: (values: Record<string, any>) => void;
}

const DynamicGroup = (props: GroupItemComponentProps) => {
  switch (props.item.component) {
    case Component.InputGroup:
      return <InputGroup key={props.item.linkId} {...props} />;
    default:
      return <ItemGroup key={props.item.linkId} {...props} />;
  }
};

export default DynamicGroup;
