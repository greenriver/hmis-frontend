import { isEmpty, pick } from 'lodash-es';
import React, { cloneElement, ReactNode, useCallback } from 'react';

import {
  FormDefinitionHandlers,
  getSafeLinkId,
} from '../hooks/useFormDefinitionHandlers';
import {
  ChangeType,
  ItemChangedFn,
  OverrideableDynamicFieldProps,
  PickListArgs,
  SeveralItemsChangedFn,
} from '../types';
import {
  buildCommonInputProps,
  getAllChildLinkIds,
  transformSubmitValues,
} from '../util/formUtil';

import AutofillFormItemWrapper from './AutofillFormItemWrapper';
import DependentFormItemWrapper from './DependentFormItemWrapper';
import DynamicField from './DynamicField';
import DynamicGroup from './DynamicGroup';
import ValueWrapper from './ValueWrapper';
import { formatCurrency } from '@/modules/hmis/hmisUtil';
import {
  Component,
  FormItem,
  ItemType,
  ServiceDetailType,
} from '@/types/gqlTypes';

export const renderItemWithWrappers = (
  renderChild: (disabled?: boolean) => ReactNode,
  item: FormItem,
  handlers: FormDefinitionHandlers
) => {
  const { disabledDependencyMap, autofillInvertedDependencyMap } = handlers;

  if (item.hidden) return null;

  const hasDependencies =
    disabledDependencyMap[item.linkId] ||
    !isEmpty(item.enableWhen) ||
    item.item?.every((item) => item.enableWhen);
  const hasAutofill =
    autofillInvertedDependencyMap[item.linkId] || !isEmpty(item.autofillValues);

  if (hasDependencies && hasAutofill) {
    return (
      <DependentFormItemWrapper handlers={handlers} item={item}>
        {(disabled) => (
          <AutofillFormItemWrapper handlers={handlers} item={item}>
            {() => renderChild(disabled)}
          </AutofillFormItemWrapper>
        )}
      </DependentFormItemWrapper>
    );
  }

  if (hasDependencies) {
    return (
      <DependentFormItemWrapper handlers={handlers} item={item}>
        {renderChild}
      </DependentFormItemWrapper>
    );
  }

  if (hasAutofill) {
    return (
      <AutofillFormItemWrapper handlers={handlers} item={item}>
        {() => renderChild()}
      </AutofillFormItemWrapper>
    );
  }

  return renderChild();
};

export interface Props {
  handlers: FormDefinitionHandlers;
  clientId?: string;
  horizontal?: boolean;
  warnIfEmpty?: boolean;
  locked?: boolean;
  bulk?: boolean;
  visible?: boolean;
  pickListArgs?: PickListArgs;
  nestingLevel: number;
  item: FormItem;
  props?: OverrideableDynamicFieldProps;
  renderFn?: (children: ReactNode) => ReactNode;
}

const DynamicFormField: React.FC<Props> = ({
  handlers,
  clientId,
  bulk,
  horizontal = false,
  warnIfEmpty = false,
  locked = false,
  visible = true,
  pickListArgs,
  item,
  nestingLevel,
  props: fieldProps,
  renderFn,
}) => {
  const values = handlers.getCleanedValues();
  const { definition, localConstants, getFieldErrors } = handlers;

  const itemChanged: ItemChangedFn = useCallback(
    ({ linkId, value: baseValue, type }) => {
      const item = handlers.itemMap[linkId];
      let value = baseValue;
      if (item) {
        if (item.type === ItemType.Integer) value = parseInt(value) || 0;
        if (item.type === ItemType.Currency) value = parseFloat(value) || 0;
      }
      handlers.methods.setValue(getSafeLinkId(linkId), value, {
        shouldDirty: type === ChangeType.User,
      });
    },
    [handlers]
  );
  const severalItemsChanged: SeveralItemsChangedFn = useCallback(
    ({ values, type }) => {
      Object.entries(values).forEach(([linkId, value]) =>
        handlers.methods.setValue(getSafeLinkId(linkId), value, {
          shouldDirty: type === ChangeType.User,
        })
      );
    },
    [handlers]
  );

  const renderChild = useCallback(
    (isDisabled?: boolean) => {
      if (bulk && item.serviceDetailType === ServiceDetailType.Client)
        return null;

      if (item.type === ItemType.Group) {
        const group = (
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
                props={props}
                renderFn={fn}
              />
            )}
            renderSummaryItem={(item, isCurrency) => {
              if (!item) return null;
              return (
                <AutofillFormItemWrapper handlers={handlers} item={item}>
                  {(autofillValue) => {
                    return isCurrency
                      ? formatCurrency(autofillValue || 0)
                      : autofillValue || 0;
                  }}
                </AutofillFormItemWrapper>
              );
            }}
            values={values}
            itemChanged={itemChanged}
            severalItemsChanged={severalItemsChanged}
            visible={visible}
            locked={locked}
            debug={
              import.meta.env.MODE === 'development'
                ? (keys?: string[]) => {
                    const sectionValues = keys ? pick(values, keys) : values;
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
        );

        // Disability group actually needs accurate values for its own mechanics, so provide them
        if (item.component === Component.DisabilityTable) {
          return (
            <ValueWrapper
              handlers={handlers}
              name={getAllChildLinkIds(item).map(getSafeLinkId)}
            >
              {/* We're just using this component to watch the group's child values and update the values prop when they change */}
              {() =>
                cloneElement(group, { values: handlers.getCleanedValues() })
              }
            </ValueWrapper>
          );
        }

        return group;
      }

      const itemComponent = (
        <ValueWrapper name={getSafeLinkId(item.linkId)} handlers={handlers}>
          {(value) => (
            <DynamicField
              value={value}
              key={item.linkId}
              item={item}
              itemChanged={itemChanged}
              disabled={isDisabled}
              nestingLevel={nestingLevel}
              errors={getFieldErrors(item)}
              horizontal={horizontal}
              pickListArgs={pickListArgs}
              warnIfEmpty={warnIfEmpty}
              {...fieldProps}
              inputProps={{
                ...fieldProps?.inputProps,
                ...buildCommonInputProps({
                  item,
                  values,
                  localConstants: localConstants || {},
                }),
                disabled: isDisabled || locked || undefined,
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
      bulk,
      clientId,
      definition,
      fieldProps,
      getFieldErrors,
      handlers,
      horizontal,
      item,
      itemChanged,
      localConstants,
      locked,
      nestingLevel,
      pickListArgs,
      renderFn,
      severalItemsChanged,
      values,
      visible,
      warnIfEmpty,
    ]
  );

  return renderItemWithWrappers(renderChild, item, handlers);
};

export default DynamicFormField;
