import { Grid } from '@mui/material';
import { omit, pick } from 'lodash-es';
import React, { cloneElement, ReactNode, useCallback } from 'react';

import { FormDefinitionHandlers } from '../hooks/useFormDefinitionHandlers';
import {
  ItemChangedFn,
  OverrideableDynamicFieldProps,
  PickListArgs,
  SeveralItemsChangedFn,
} from '../types';
import { buildCommonInputProps, transformSubmitValues } from '../util/formUtil';

import DependentFormItemWrapper from './DependentFormItemWrapper';
import DynamicField from './DynamicField';
import DynamicGroup from './DynamicGroup';
import ValueWrapper from './ValueWrapper';
import DynamicViewField from './viewable/DynamicViewField';
import DynamicFormFieldAutofillSummary from '@/modules/form/components/DynamicFormFieldAutofillSummary';
import { Component, FormItem, ItemType } from '@/types/gqlTypes';

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
  const { definition, localConstants, getFieldErrors } = handlers;

  // Renders the appropriate field component based on item type and configuration
  const renderChild = useCallback(
    (isDisabled?: boolean) => {
      if (item.type === ItemType.Group) {
        const group = (
          <ValueWrapper handlers={handlers} item={item}>
            {(values) => (
              <DynamicGroup
                item={item}
                clientId={clientId}
                key={item.linkId}
                nestingLevel={nestingLevel}
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
                renderSummaryItem={(item, isCurrency) => {
                  if (item)
                    return (
                      <DynamicFormFieldAutofillSummary
                        item={item}
                        isCurrency={isCurrency}
                      />
                    );
                  return null;
                }}
                values={values}
                itemChanged={itemChanged}
                severalItemsChanged={severalItemsChanged}
                visible={visible}
                debug={
                  import.meta.env.MODE === 'development'
                    ? (keys?: string[]) => {
                        const currentValues = handlers.getValues();
                        const sectionValues = keys
                          ? pick(currentValues, keys)
                          : currentValues;
                        const valuesByKey = transformSubmitValues({
                          definition,
                          values: sectionValues,
                          keyByFieldName: true,
                        });
                        // eslint-disable-next-line no-console
                        console.group(item.text || item.linkId);
                        // eslint-disable-next-line no-console
                        console.log(sectionValues);
                        // eslint-disable-next-line no-console
                        console.log(valuesByKey);
                        // eslint-disable-next-line no-console
                        console.groupEnd();
                      }
                    : undefined
                }
              />
            )}
          </ValueWrapper>
        );

        // Disability group actually needs accurate values for its own mechanics, so provide them
        if (item.component === Component.DisabilityTable) {
          return (
            <ValueWrapper handlers={handlers} item={item}>
              {/* We're just using this component to watch the group's child values and update the values prop when they change */}
              {(values) => cloneElement(group, { values })}
            </ValueWrapper>
          );
        }

        return group;
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
                // Needed because there are some enable/disabled and autofill dependencies that depend on PickListOption.labels that are fetched (PriorLivingSituation is an example)
                adjustValue={itemChanged}
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
      definition,
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
