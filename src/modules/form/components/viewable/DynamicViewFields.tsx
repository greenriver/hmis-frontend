import { Grid } from '@mui/material';
import React, { ReactNode, useCallback } from 'react';

import { FormDefinitionHandlers } from '../../hooks/useFormDefinitionHandlers';
import {
  ChangeType,
  FormValues,
  ItemChangedFn,
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
  pickListArgs?: PickListArgs;
  handlers: FormDefinitionHandlers;
  nestingLevel: number;
  item: FormItem;
  props?: OverrideableDynamicFieldProps;
  renderFn?: (children: ReactNode) => ReactNode;
  localConstants?: LocalConstants;
  values: FormValues;
  itemChanged: ItemChangedFn;
}

const DynamicViewFormField: React.FC<Props> = ({
  horizontal = false,
  pickListArgs,
  handlers,
  item,
  nestingLevel,
  props: fieldProps,
  renderFn,
  localConstants,
  values,
  itemChanged,
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
              itemChanged={itemChanged}
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
              pickListArgs={pickListArgs}
              localConstants={localConstants}
              // Needed because there are some enable/disabled and autofill dependencies that depend on PickListOption.labels that are fetched (PriorLivingSituation is an example)
              adjustValue={itemChanged}
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

  const itemChanged: ItemChangedFn = useCallback(
    ({ linkId, value: baseValue, type }) => {
      const item = handlers.itemMap[linkId];
      let value = baseValue;
      if (item) {
        if (item.type === ItemType.Integer) value = parseInt(value) || 0;
        if (item.type === ItemType.Currency) value = parseFloat(value) || 0;
      }
      handlers.methods.setValue(linkId, value, {
        shouldDirty: type === ChangeType.User,
      });
    },
    [handlers]
  );

  return (
    <>
      {definition.item.map((item) => (
        <DynamicViewFormField
          key={item.linkId}
          handlers={handlers}
          nestingLevel={0}
          item={item}
          values={values}
          itemChanged={itemChanged}
          {...props}
        />
      ))}
    </>
  );
};

export default DynamicViewFields;
