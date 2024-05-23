import { Grid } from '@mui/material';
import React, { ReactNode } from 'react';

import {
  FormValues,
  ItemChangedFn,
  ItemMap,
  OverrideableDynamicFieldProps,
  PickListArgs,
} from '../../types';
import { isEnabled } from '../../util/formUtil';

import DynamicViewField from './DynamicViewField';
import DynamicViewGroup from './DynamicViewGroup';

import {
  DisabledDisplay,
  FormDefinitionJson,
  FormItem,
  ItemType,
  ValidationError,
} from '@/types/gqlTypes';

export interface Props {
  definition: FormDefinitionJson;
  errors?: ValidationError[];
  warnings?: ValidationError[];
  horizontal?: boolean;
  visible?: boolean;
  pickListArgs?: PickListArgs;
  values: FormValues;
  itemChanged: ItemChangedFn;
  itemMap: ItemMap;
  disabledLinkIds: string[];
}

const DynamicViewFields: React.FC<Props> = ({
  definition,
  itemMap,
  horizontal = false,
  pickListArgs,
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
    if (isDisabled && item.disabledDisplay === DisabledDisplay.Hidden)
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
          value={
            isDisabled &&
            item.disabledDisplay !== DisabledDisplay.ProtectedWithValue
              ? undefined
              : values[item.linkId]
          }
          disabled={isDisabled}
          horizontal={horizontal}
          pickListArgs={pickListArgs}
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
