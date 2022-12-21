import { Box } from '@mui/material';
import { ReactNode } from 'react';

import { DynamicFieldProps } from './DynamicField';
import FormCard from './group/FormCard';
import HorizontalGroup from './group/HorizontalGroup';
import InputGroup from './group/InputGroup';
import QuestionGroup from './group/QuestionGroup';

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
  // Always render top-level groups as cards
  console.log('DynamicGroup', props);
  if (props.nestingLevel === 0 && !props.item.component) {
    return <FormCard key={props.item.linkId} {...props} />;
  }

  switch (props.item.component) {
    case Component.InputGroup:
      return <InputGroup key={props.item.linkId} {...props} />;
    case Component.HorizontalGroup:
      return <HorizontalGroup key={props.item.linkId} {...props} />;
    case Component.InfoGroup:
      return (
        <Box
          sx={{
            backgroundColor: (theme) => theme.palette.grey[100],
            // borderLeft: (theme) => `1px solid ${theme.palette.grey[300]}`,
            // backgroundColor: 'rgb(255,255,224, 0.8)',
            borderRadius: 1,
            // TODO make flexible if we go with this
            width: '415px',
            pb: 1,
            px: 1,
            ml: -1,
          }}
        >
          <QuestionGroup key={props.item.linkId} {...props} />
        </Box>
      );
    default:
      return <QuestionGroup key={props.item.linkId} {...props} />;
  }
};

export default DynamicGroup;
