import { Grid } from '@mui/material';
import React, { ReactNode } from 'react';

import {
  FormValues,
  ItemChangedFn,
  ItemMap,
  OverrideableDynamicFieldProps,
} from '../../types';
import { isEnabled } from '../../util/formUtil';

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
  itemChanged: ItemChangedFn;
  itemMap: ItemMap;
  disabledLinkIds: string[];
}

const DynamicViewFields: React.FC<Props> = ({
  definition,
  bulk,
  itemMap,
  horizontal = false,
  pickListRelationId,
  values,
  disabledLinkIds,
  itemChanged,
  ...fieldsProps
}) => {
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
      <Grid item key={item.linkId}>
        <DynamicViewField
          item={item}
          value={isDisabled ? undefined : values[item.linkId]}
          nestingLevel={nestingLevel}
          horizontal={horizontal}
          pickListRelationId={pickListRelationId}
          // Needed because there are some enable/disabled and autofill dependencies that depend on PickListOption.labels that are fetched (PriorLivingSituation is an example)
          adjustValue={itemChanged}
          {...props}
        />
      </Grid>
    );
    if (renderFn) {
      return renderFn(itemComponent);
    }
    return itemComponent;
  };

  return <>{definition.item.map((item) => renderItem(item, 0))}</>;
};

export default DynamicViewFields;
