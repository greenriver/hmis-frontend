import { pick } from 'lodash-es';
import React, { ReactNode, useCallback } from 'react';

import {
  FormValues,
  ItemChangedFn,
  ItemMap,
  OverrideableDynamicFieldProps,
  SeveralItemsChangedFn,
} from '../types';
import {
  buildCommonInputProps,
  isEnabled,
  transformSubmitValues,
} from '../util/formUtil';

import DynamicField from './DynamicField';
import DynamicGroup from './DynamicGroup';

import {
  DisabledDisplay,
  FormDefinitionJson,
  FormItem,
  ItemType,
  ServiceDetailType,
  ValidationError,
} from '@/types/gqlTypes';

export interface Props {
  definition: FormDefinitionJson;
  errors?: ValidationError[];
  warnings?: ValidationError[];
  horizontal?: boolean;
  warnIfEmpty?: boolean;
  locked?: boolean;
  bulk?: boolean;
  visible?: boolean;
  pickListRelationId?: string;
  values: FormValues;
  itemChanged: ItemChangedFn;
  severalItemsChanged: SeveralItemsChangedFn;
  itemMap: ItemMap;
  disabledLinkIds: string[];
}

const DynamicFormFields: React.FC<Props> = ({
  definition,
  errors = [],
  bulk,
  horizontal = false,
  warnIfEmpty = false,
  locked = false,
  visible = true,
  pickListRelationId,
  values,
  disabledLinkIds,
  itemChanged,
  severalItemsChanged,
}) => {
  // Get errors for a particular field
  const getFieldErrors = useCallback(
    (item: FormItem) => {
      if (!errors || !item.mapping) return undefined;
      return errors.filter(
        (e) =>
          e.linkId === item.linkId ||
          (e.attribute && e.attribute === item.mapping?.fieldName)
      );
    },
    [errors]
  );

  // Recursively render an item
  const renderItem = (
    item: FormItem,
    nestingLevel: number,
    props?: OverrideableDynamicFieldProps,
    renderFn?: (children: ReactNode) => ReactNode
  ) => {
    const isDisabled = !isEnabled(item, disabledLinkIds);
    if (isDisabled && item.disabledDisplay !== DisabledDisplay.Protected)
      return null;
    if (bulk && item.serviceDetailType === ServiceDetailType.Client)
      return null;

    if (item.type === ItemType.Group) {
      return (
        <DynamicGroup
          item={item}
          key={item.linkId}
          nestingLevel={nestingLevel}
          renderChildItem={(item, props, fn) =>
            renderItem(item, nestingLevel + 1, props, fn)
          }
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
                  console.group(item.text || item.linkId);
                  console.log(sectionValues);
                  console.log(valuesByKey);
                  console.groupEnd();
                }
              : undefined
          }
        />
      );
    }

    const itemComponent = (
      <DynamicField
        key={item.linkId}
        item={item}
        itemChanged={itemChanged}
        value={isDisabled ? undefined : values[item.linkId]}
        nestingLevel={nestingLevel}
        errors={getFieldErrors(item)}
        horizontal={horizontal}
        pickListRelationId={pickListRelationId}
        warnIfEmpty={warnIfEmpty}
        {...props}
        inputProps={{
          ...props?.inputProps,
          ...buildCommonInputProps(item, values),
          disabled: isDisabled || locked || undefined,
        }}
      />
    );
    if (renderFn) {
      return renderFn(itemComponent);
    }
    return itemComponent;
  };

  return <>{definition.item.map((item) => renderItem(item, 0))}</>;
};

export default DynamicFormFields;
