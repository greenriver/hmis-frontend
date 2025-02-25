import { Grid } from '@mui/material';
import React, { ReactNode } from 'react';

import { FormDefinitionHandlers } from '../../hooks/useFormDefinitionHandlers';
import {
  FormValues,
  LocalConstants,
  OverrideableDynamicFieldProps,
  PickListArgs,
} from '../../types';
import ValueWrapper from '../ValueWrapper';
import DynamicViewField from './DynamicViewField';
import DynamicViewGroup from './DynamicViewGroup';
import DependentFormItemWrapper from '@/modules/form/components/DependentFormItemWrapper';
import { FormItem, ItemType } from '@/types/gqlTypes';

export interface Props {
  horizontal?: boolean;
  visible?: boolean;
  handlers: FormDefinitionHandlers;
  nestingLevel: number;
  item: FormItem;
  props?: OverrideableDynamicFieldProps;
  renderFn?: (children: ReactNode) => ReactNode;
  localConstants?: LocalConstants;
  values: FormValues;
}

const DynamicViewFormField: React.FC<Props> = ({
  horizontal = false,
  handlers,
  item,
  nestingLevel,
  props: fieldProps,
  renderFn,
  localConstants,
  values,
  ...fieldsProps
}) => {
  // Recursively render an item
  const renderChild = (isDisabled?: boolean) => {
    if (item.type === ItemType.Group) {
      return (
        <DynamicViewGroup
          item={item}
          key={item.linkId}
          nestingLevel={nestingLevel}
          renderChildItem={(item, props, fn) => (
            <DynamicViewFormField
              key={item.linkId}
              handlers={handlers}
              item={item}
              nestingLevel={nestingLevel + 1}
              props={props}
              renderFn={fn}
              values={values}
            />
          )}
          values={values}
          {...fieldsProps}
        />
      );
    }

    const itemComponent = (
      <Grid item key={item.linkId}>
        <ValueWrapper item={item} handlers={handlers}>
          {(values) => (
            <DynamicViewField
              item={item}
              value={values[item.linkId]}
              disabled={isDisabled}
              horizontal={horizontal}
              localConstants={localConstants}
              {...fieldProps}
            />
          )}
        </ValueWrapper>
      </Grid>
    );
    if (renderFn) {
      return renderFn(itemComponent);
    }
    return itemComponent;
  };

  return <DependentFormItemWrapper item={item} renderChild={renderChild} />;
};

export interface DynamicViewFieldsProps {
  handlers: FormDefinitionHandlers;
  clientId?: string;
  horizontal?: boolean;
  warnIfEmpty?: boolean;
  visible?: boolean;
  pickListArgs?: PickListArgs;
}

const DynamicViewFields: React.FC<DynamicViewFieldsProps> = ({
  handlers,
  ...props
}) => {
  const definition = handlers.definition;
  const values = handlers.methods.getValues();

  return (
    <>
      {definition.item.map((item) => (
        <DynamicViewFormField
          key={item.linkId}
          handlers={handlers}
          nestingLevel={0}
          item={item}
          values={values}
          {...props}
        />
      ))}
    </>
  );
};

export default DynamicViewFields;
