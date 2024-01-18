import { isEmpty, pick } from 'lodash-es';
import React, { ReactNode, useCallback } from 'react';

import {
  ChangeType,
  ItemChangedFn,
  OverrideableDynamicFieldProps,
  PickListArgs,
  SeveralItemsChangedFn,
} from '../../types';
import {
  buildCommonInputProps,
  transformSubmitValues,
} from '../../util/formUtil';

import AutofillFormItemWrapper from './AutofillFormItemWrapper';
import DependentFormItemWrapper from './DependentFormItemWrapper';
import RefactorField from './RefactorField';
import RefactorGroup from './RefactorGroup';

import {
  FormDefinitionHandlers,
  getSafeLinkId,
} from './useFormDefinitionHandlers';
import {
  DisabledDisplay,
  FormItem,
  ItemType,
  ServiceDetailType,
} from '@/types/gqlTypes';

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

const RefactorFormField: React.FC<Props> = ({
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
  // TODO: Remove these once drilled down
  const values = handlers.getCleanedValues();
  const {
    definition,
    localConstants,
    disabledDependencyMap,
    autofillInvertedDependencyMap,
    getFieldErrors,
  } = handlers;

  // TODO: Push these down to individual fields maybe?
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
      if (isDisabled && item.disabledDisplay === DisabledDisplay.Hidden)
        return null;
      if (bulk && item.serviceDetailType === ServiceDetailType.Client)
        return null;

      if (item.type === ItemType.Group) {
        return (
          <RefactorGroup
            item={item}
            clientId={clientId}
            key={item.linkId}
            nestingLevel={nestingLevel}
            renderChildItem={(item, props, fn) => (
              <RefactorFormField
                key={item.linkId}
                handlers={handlers}
                item={item}
                nestingLevel={nestingLevel + 1}
                props={props}
                renderFn={fn}
              />
            )}
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
      }

      const itemComponent = (
        <RefactorField
          handlers={handlers}
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

  if (item.hidden) return null;

  const hasDependencies =
    disabledDependencyMap[item.linkId] || !isEmpty(item.enableWhen);
  const hasAutofill =
    autofillInvertedDependencyMap[item.linkId] || !isEmpty(item.autofillValues);

  if (hasDependencies && hasAutofill) {
    <DependentFormItemWrapper handlers={handlers} item={item}>
      {(disabled) => (
        <AutofillFormItemWrapper handlers={handlers} item={item}>
          {() => renderChild(disabled)}
        </AutofillFormItemWrapper>
      )}
    </DependentFormItemWrapper>;
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

export default RefactorFormField;
