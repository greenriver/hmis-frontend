import { pull } from 'lodash-es';
import React, { ReactNode, useCallback } from 'react';

import { OverrideableDynamicFieldProps } from '../types';
import {
  autofillValues,
  buildCommonInputProps,
  FormValues,
  ItemMap,
  LinkIdMap,
  shouldEnableItem,
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
  setValues: React.Dispatch<React.SetStateAction<FormValues>>;
  itemChanged?: (linkId: string, value: any) => void;
  severalItemsChanged?: (values: Record<string, any>) => void;
  itemMap: ItemMap;
  autofillDependencyMap: LinkIdMap;
  enabledDependencyMap: LinkIdMap;
  disabledLinkIds: string[];
  setDisabledLinkIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export const isEnabled = (
  item: FormItem,
  disabledLinkIds: string[] = []
): boolean => {
  if (item.hidden) return false;
  if (!item.enableWhen && item.item) {
    // This is a group. Only show it if some children are enabled.
    return item.item.some((i) => isEnabled(i, disabledLinkIds));
  }
  // console.log({disabledLinkIds})
  return !disabledLinkIds.includes(item.linkId);
};

export const isShown = (item: FormItem, disabledLinkIds: string[] = []) => {
  if (
    !isEnabled(item, disabledLinkIds) &&
    item.disabledDisplay !== DisabledDisplay.Protected
  )
    return false;

  return true;
};

const DynamicFormFields: React.FC<Props> = ({
  definition,
  errors = [],
  bulk,
  itemMap,
  autofillDependencyMap, // { linkId => array of Link IDs that depend on it for autofill }
  enabledDependencyMap, // { linkId => array of Link IDs that depend on it for enabled status }
  horizontal = false,
  warnIfEmpty = false,
  locked = false,
  visible = true,
  pickListRelationId,
  values,
  setValues,
  itemChanged: itemsChangedProp,
  severalItemsChanged: severalItemsChangedProp,
  disabledLinkIds,
  setDisabledLinkIds,
}) => {
  // Updates localValues map in-place
  const updateAutofillValues = useCallback(
    (changedLinkIds: string[], localValues: any) => {
      changedLinkIds.forEach((changedLinkId) => {
        if (!autofillDependencyMap[changedLinkId]) return;
        autofillDependencyMap[changedLinkId].forEach((dependentLinkId) => {
          autofillValues(itemMap[dependentLinkId], localValues, itemMap);
        });
      });
    },
    [itemMap, autofillDependencyMap]
  );

  /**
   * Update the `disabledLinkIds` state.
   * This only evaluates the enableWhen conditions for items that are
   * dependent on the item that just changed ("changedLinkid").
   */
  const updateDisabledLinkIds = useCallback(
    (changedLinkIds: string[], localValues: any) => {
      // If none of these are dependencies, return immediately
      if (!changedLinkIds.find((id) => !!enabledDependencyMap[id])) return;

      setDisabledLinkIds((oldList) => {
        const newList = [...oldList];
        changedLinkIds.forEach((changedLinkId) => {
          if (!enabledDependencyMap[changedLinkId]) return;

          enabledDependencyMap[changedLinkId].forEach((dependentLinkId) => {
            const enabled = shouldEnableItem(
              itemMap[dependentLinkId],
              localValues,
              itemMap
            );
            if (enabled && newList.includes(dependentLinkId)) {
              pull(newList, dependentLinkId);
            } else if (!enabled && !newList.includes(dependentLinkId)) {
              newList.push(dependentLinkId);
            }
          });
        });

        return newList;
      });
    },
    [itemMap, enabledDependencyMap, setDisabledLinkIds]
  );

  const itemChanged = useCallback(
    (linkId: string, value: any) => {
      if (itemsChangedProp) itemsChangedProp(linkId, value);
      setValues((currentValues) => {
        const newValues = { ...currentValues };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        newValues[linkId] = value;
        // Updates dependent autofill questions (modifies newValues in-place)
        updateAutofillValues([linkId], newValues);
        // Update list of disabled linkIds based on new values
        updateDisabledLinkIds([linkId], newValues);

        return newValues;
      });
    },
    [updateAutofillValues, updateDisabledLinkIds, setValues, itemsChangedProp]
  );

  const severalItemsChanged = useCallback(
    (values: Record<string, any>) => {
      if (severalItemsChangedProp) severalItemsChangedProp(values);
      setValues((currentValues) => {
        const newValues = { ...currentValues, ...values };
        // Updates dependent autofill questions (modifies newValues in-place)
        updateAutofillValues(Object.keys(values), newValues);
        // Update list of disabled linkIds based on new values
        updateDisabledLinkIds(Object.keys(values), newValues);
        // console.debug('DynamicForm', newValues);
        return newValues;
      });
    },
    [
      updateDisabledLinkIds,
      updateAutofillValues,
      setValues,
      severalItemsChangedProp,
    ]
  );

  // Get errors for a particular field
  const getFieldErrors = useCallback(
    (item: FormItem) => {
      if (!errors || !item.fieldName) return undefined;
      return errors.filter(
        (e) => e.attribute === item.fieldName || e.linkId === item.linkId
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
