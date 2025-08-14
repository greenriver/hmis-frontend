import { Grid } from '@mui/material';
import { omit } from 'lodash-es';
import React, { ReactNode, useCallback } from 'react';

import { FormDefinitionHandlers } from '../hooks/useFormDefinitionHandlers';
import {
  ItemChangedFn,
  OverrideableDynamicFieldProps,
  PickListArgs,
  SeveralItemsChangedFn,
} from '../types';
import { buildCommonInputProps } from '../util/formUtil';

import DependentFormItemWrapper from './DependentFormItemWrapper';
import DynamicField from './DynamicField';
import DynamicGroup from './DynamicGroup';
import ValueWrapper from './ValueWrapper';
import DynamicViewField from './viewable/DynamicViewField';
import { FormItem, ItemType } from '@/types/gqlTypes';

export interface Props {
  handlers: FormDefinitionHandlers;
  clientId?: string;
  horizontal?: boolean;
  warnIfEmpty?: boolean; // whether to render warn if empty treatment if applicable (specified on item)
  visible?: boolean;
  pickListArgs?: PickListArgs;
  nestingLevel: number;
  item: FormItem;
  itemChanged: ItemChangedFn;
  severalItemsChanged: SeveralItemsChangedFn;
  props?: OverrideableDynamicFieldProps;
  renderFn?: (children: ReactNode) => ReactNode;
}

/**
 * Renders form field components based on FormItem definitions, handling dependencies,
 * autofill behavior, and conditional rendering
 */
const DynamicFormField: React.FC<Props> = ({
  handlers,
  clientId,
  warnIfEmpty = false,
  horizontal = false,
  visible = true,
  pickListArgs,
  item,
  nestingLevel,
  props: fieldProps,
  itemChanged,
  severalItemsChanged,
  renderFn,
}) => {
  const { localConstants, getFieldErrors } = handlers;

  // Renders the appropriate field component based on item type and configuration
  const renderChild = useCallback(
    (isDisabled?: boolean) => {
      if (item.type === ItemType.Group) {
        return (
          <DynamicGroup
            item={item}
            clientId={clientId}
            key={item.linkId}
            nestingLevel={nestingLevel}
            handlers={handlers}
            renderChildItem={(item, props, fn) => (
              <DynamicFormField
                key={item.linkId}
                handlers={handlers}
                item={item}
                nestingLevel={nestingLevel + 1}
                warnIfEmpty={warnIfEmpty}
                pickListArgs={pickListArgs}
                props={props}
                itemChanged={itemChanged}
                severalItemsChanged={severalItemsChanged}
                renderFn={fn}
              />
            )}
            itemChanged={itemChanged}
            severalItemsChanged={severalItemsChanged}
            visible={visible}
          />
        );
      }

      const itemComponent = item.readOnly ? (
        <Grid item key={item.linkId}>
          <ValueWrapper handlers={handlers} item={item}>
            {(values) => (
              <DynamicViewField
                item={item}
                value={values[item.linkId]}
                disabled={isDisabled}
                horizontal={horizontal}
                pickListArgs={pickListArgs}
                // Needed to support referencing local constants in expression evaluation (DynamicDisplay)
                localConstants={localConstants}
                {...fieldProps}
              />
            )}
          </ValueWrapper>
        </Grid>
      ) : (
        <ValueWrapper item={item} handlers={handlers}>
          {(values) => (
            <DynamicField
              value={values[item.linkId]}
              handlers={handlers}
              key={item.linkId}
              item={item}
              itemChanged={itemChanged}
              disabled={isDisabled || fieldProps?.disabled}
              errors={getFieldErrors(item)}
              horizontal={horizontal}
              pickListArgs={pickListArgs}
              warnIfEmpty={warnIfEmpty}
              // Needed to support referencing local constants in expression evaluation (DynamicDisplay)
              localConstants={localConstants}
              {...omit(fieldProps, ['disabled'])}
              inputProps={{
                ...fieldProps?.inputProps,
                ...buildCommonInputProps({
                  item,
                  values,
                  localConstants: localConstants || {},
                }),
                disabled: isDisabled,
              }}
            />
          )}
        </ValueWrapper>
      );
      if (renderFn) {
        return renderFn(itemComponent);
      }
      return itemComponent;
    },
    [
      clientId,
      fieldProps,
      getFieldErrors,
      handlers,
      horizontal,
      item,
      itemChanged,
      localConstants,
      nestingLevel,
      pickListArgs,
      renderFn,
      severalItemsChanged,
      visible,
      warnIfEmpty,
    ]
  );

  return <DependentFormItemWrapper item={item} renderChild={renderChild} />;
};

export default DynamicFormField;
