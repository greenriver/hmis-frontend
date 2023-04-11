import React, { ReactNode, useCallback } from 'react';

import {
  OverrideableDynamicFieldProps,
  FormValues,
  ItemMap,
  LinkIdMap,
  AdjustValueFn,
} from '../../types';
import { isEnabled } from '../../util/formUtil';
import { setDisabledLinkIdsBase } from '../DynamicFormFields';

import DynamicViewField from './DynamicViewField';
import DynamicViewGroup from './DynamicViewGroup';

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
  bulk?: boolean;
  visible?: boolean;
  pickListRelationId?: string;
  values: FormValues;
  setValues: React.Dispatch<React.SetStateAction<FormValues>>;
  itemMap: ItemMap;
  autofillDependencyMap: LinkIdMap;
  enabledDependencyMap: LinkIdMap;
  disabledLinkIds: string[];
  setDisabledLinkIds: React.Dispatch<React.SetStateAction<string[]>>;
}

const DynamicViewFields: React.FC<Props> = ({
  definition,
  bulk,
  itemMap,
  // autofillDependencyMap, // { linkId => array of Link IDs that depend on it for autofill }
  enabledDependencyMap, // { linkId => array of Link IDs that depend on it for enabled status }
  horizontal = false,
  pickListRelationId,
  values,
  setValues,
  disabledLinkIds,
  setDisabledLinkIds,
  ...fieldsProps
}) => {
  const updateDisabledLinkIds = useCallback(
    (changedLinkIds: string[], localValues: any) => {
      setDisabledLinkIdsBase(changedLinkIds, localValues, setDisabledLinkIds, {
        enabledDependencyMap,
        itemMap,
      });
    },
    [itemMap, enabledDependencyMap, setDisabledLinkIds]
  );

  const adjustValue: AdjustValueFn = useCallback(
    (input) => {
      const { linkId, value } = input;
      setValues((currentValues) => {
        const newValues = { ...currentValues };
        newValues[linkId] = value;
        updateDisabledLinkIds([linkId], newValues);

        return newValues;
      });
    },
    [updateDisabledLinkIds, setValues]
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
        <DynamicViewGroup
          item={item}
          key={item.linkId}
          nestingLevel={nestingLevel}
          renderChildItem={(item, props, fn) =>
            renderItem(item, nestingLevel + 1, props, fn)
          }
          values={values}
          {...fieldsProps}
        />
      );
    }

    const itemComponent = (
      <DynamicViewField
        key={item.linkId}
        item={item}
        value={isDisabled ? undefined : values[item.linkId]}
        nestingLevel={nestingLevel}
        horizontal={horizontal}
        pickListRelationId={pickListRelationId}
        adjustValue={adjustValue}
        {...props}
      />
    );
    if (renderFn) {
      return renderFn(itemComponent);
    }
    return itemComponent;
  };

  return <>{definition.item.map((item) => renderItem(item, 0))}</>;
};

export default DynamicViewFields;
