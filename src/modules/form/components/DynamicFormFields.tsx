import { pick } from 'lodash-es';
import React, { ReactNode, useCallback } from 'react';

import {
  FormValues,
  ItemChangedFn,
  ItemMap,
  LocalConstants,
  OverrideableDynamicFieldProps,
  PickListArgs,
  SeveralItemsChangedFn,
} from '../types';
import {
  buildCommonInputProps,
  isEnabled,
  transformSubmitValues,
} from '../util/formUtil';

import DynamicField from './DynamicField';
import DynamicGroup from './DynamicGroup';

import DynamicViewField from '@/modules/form/components/viewable/DynamicViewField';
import {
  DisabledDisplay,
  FormDefinitionJson,
  FormItem,
  ItemType,
  ValidationError,
} from '@/types/gqlTypes';

export interface Props {
  clientId?: string;
  definition: FormDefinitionJson;
  errors?: ValidationError[];
  warnings?: ValidationError[];
  horizontal?: boolean;
  warnIfEmpty?: boolean;
  locked?: boolean;
  visible?: boolean;
  pickListArgs?: PickListArgs;
  values: FormValues;
  itemChanged: ItemChangedFn;
  severalItemsChanged: SeveralItemsChangedFn;
  itemMap: ItemMap;
  disabledLinkIds: string[];
  localConstants?: LocalConstants;
}

const DynamicFormFields: React.FC<Props> = ({
  clientId,
  definition,
  errors = [],
  horizontal = false,
  warnIfEmpty = false,
  locked = false,
  visible = true,
  pickListArgs,
  values,
  disabledLinkIds,
  itemChanged,
  severalItemsChanged,
  localConstants,
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
    if (isDisabled && item.disabledDisplay === DisabledDisplay.Hidden)
      return null;

    if (item.type === ItemType.Group) {
      return (
        <DynamicGroup
          item={item}
          clientId={clientId}
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
          {...props}
        />
      );
    }

    const itemComponent = item.readOnly ? (
      <DynamicViewField
        item={item}
        value={values[item.linkId]}
        disabled={isDisabled}
        nestingLevel={nestingLevel}
        horizontal={horizontal}
        pickListArgs={pickListArgs}
        // Needed because there are some enable/disabled and autofill dependencies that depend on PickListOption.labels that are fetched (PriorLivingSituation is an example)
        adjustValue={itemChanged}
        {...props}
      />
    ) : (
      <DynamicField
        key={item.linkId}
        item={item}
        itemChanged={itemChanged}
        value={
          isDisabled &&
          item.disabledDisplay !== DisabledDisplay.ProtectedWithValue
            ? undefined
            : values[item.linkId]
        }
        nestingLevel={nestingLevel}
        errors={getFieldErrors(item)}
        horizontal={horizontal}
        pickListArgs={pickListArgs}
        warnIfEmpty={warnIfEmpty}
        {...props}
        inputProps={{
          ...props?.inputProps,
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
  };

  return <>{definition.item.map((item) => renderItem(item, 0))}</>;
};

export default DynamicFormFields;
