import { Grid } from '@mui/material';
import React, { ReactNode } from 'react';
import DynamicViewField from '@/modules/form/components/viewable/DynamicViewField';
import { FormValues, ItemChangedFn, PickListArgs } from '@/modules/form/types';
import { DisabledDisplay, FormItem } from '@/types/gqlTypes';

export interface DynamicViewItemProps {
  item: FormItem;
  isDisabled: boolean;
  horizontal: boolean;
  nestingLevel: number;
  values: FormValues;
  renderFn?: (children: ReactNode) => ReactNode;
  pickListArgs?: PickListArgs;
  itemChanged: ItemChangedFn;
}

const DynamicViewItem: React.FC<DynamicViewItemProps> = ({
  item,
  isDisabled,
  values,
  nestingLevel,
  horizontal,
  pickListArgs,
  itemChanged,
  renderFn,
  ...props
}) => {
  const itemComponent = (
    <Grid item>
      <DynamicViewField
        item={item}
        value={
          isDisabled &&
          item.disabledDisplay !== DisabledDisplay.ProtectedWithValue
            ? undefined
            : values[item.linkId]
        }
        disabled={isDisabled}
        nestingLevel={nestingLevel}
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

export default DynamicViewItem;
