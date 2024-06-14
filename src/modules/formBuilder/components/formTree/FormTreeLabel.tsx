import EditIcon from '@mui/icons-material/Edit';
import { IconButton, Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { TreeItem2Label, UseTreeItem2Parameters } from '@mui/x-tree-view';
import { useTreeItem2 } from '@mui/x-tree-view/useTreeItem2/useTreeItem2';
import { UseTreeItem2LabelSlotProps } from '@mui/x-tree-view/useTreeItem2/useTreeItem2.types';
import { cloneDeep, get } from 'lodash-es';
import React, { useCallback, useMemo } from 'react';
import {
  useFieldArray,
  useFormContext,
  useFormState,
  useWatch,
} from 'react-hook-form';
import { DownIcon, UpIcon } from '@/components/elements/SemanticIcons';
import { FORM_ITEM_PALETTE } from '@/modules/formBuilder/components/FormBuilderPalette';
import { FormTreeContext } from '@/modules/formBuilder/components/formTree/FormTreeContext';
import { getItemFromTree } from '@/modules/formBuilder/components/formTree/formTreeUtil';
import { FormItemPaletteType } from '@/modules/formBuilder/components/formTree/types';
import {
  getItemIdMap,
  getPathContext,
  insertItemToDefinition,
  removeItemFromDefinition,
} from '@/modules/formBuilder/formBuilderUtil';
import { FormDefinitionJson, ItemType } from '@/types/gqlTypes';

export const getItemDisplayAttrs = (type: ItemType): FormItemPaletteType => {
  return FORM_ITEM_PALETTE[type];
};

export interface FormTreeLabelProps
  extends UseTreeItem2LabelSlotProps,
    Omit<UseTreeItem2Parameters, 'children'> {
  itemId: string;
}

const FormTreeLabel: React.FC<FormTreeLabelProps> = (props) => {
  const { id, itemId, label, disabled, children } = props;

  const { onEditButtonClicked } = React.useContext(FormTreeContext);

  const { control, getValues, reset } = useFormContext();

  const values = useWatch({ name: 'item', control });

  // re-generate itemIdMap each time values change (linkId=>position)
  const itemIdMap = useMemo(() => getItemIdMap(values), [values]);

  const { isSubmitting } = useFormState({ control });

  const itemPath = itemIdMap[itemId]; // undefined
  if (!itemPath) throw new Error(`No itemPath found for linkId ${itemId}`);

  // TODO rename some of these?
  const { parentPath, index: thisIndex } = getPathContext(itemPath);
  const { parentPath: grandparentPath, index: parentIndex } = getPathContext(
    parentPath.replace(/\.item$/, '')
  );

  // RHF swap is used for swapping items within an array
  const { swap } = useFieldArray({ control, name: parentPath });

  // TODO use watch instead of getvalues here?
  const thisLayer = getValues(parentPath);

  const prevItem = thisLayer[thisIndex - 1];
  const prevLinkId = prevItem?.linkId || '';
  const prevItemPath = prevLinkId ? itemIdMap[prevLinkId] + '.item' : '';

  const nextItem = thisLayer[thisIndex + 1];
  const nextLinkId = nextItem?.linkId || '';
  const nextItemPath = nextLinkId ? itemIdMap[nextLinkId] + '.item' : '';

  const { getLabelProps, publicAPI } = useTreeItem2({
    id,
    itemId,
    children,
    label,
    disabled,
  });

  const treeItem = publicAPI.getItem(itemId);
  const item = useMemo(() => getItemFromTree(treeItem), [treeItem]);

  const displayAttrs = useMemo(
    () => getItemDisplayAttrs(item.type),
    [item.type]
  );

  const labelProps = getLabelProps();

  // TODO(#6094) - Disable up/down buttons if item can't move up/down
  // TODO(#6094) - Limit nesting depth to 5
  // TODO(#6094) - Auto open a group when an item is moved into it.
  //  This involves turning Mui Tree's expandedItems into a controlled prop - see https://github.com/greenriver/hmis-frontend/pull/797
  // TODO move to hook
  const onReorder = useCallback(
    (direction: 'up' | 'down') => {
      if (direction === 'up') {
        if (thisIndex > 0) {
          // If index > 0, we can move this item up within its existing "layer"
          const prevItem = thisLayer[thisIndex - 1];
          if (prevItem.type === ItemType.Group) {
            // CASE 1: If the item above it is a group, we remove this item and
            // append it to the "sibling" group above it
            console.log('case 1');
            const oldForm = cloneDeep(getValues());

            removeItemFromDefinition({
              removeFromPath: parentPath,
              removeFromIndex: thisIndex,
              definition: oldForm as FormDefinitionJson,
            });
            insertItemToDefinition({
              insertPath: prevItemPath,
              insertAtIndex: get(oldForm, prevItemPath).length,
              definition: oldForm as FormDefinitionJson,
              item,
            });

            reset(oldForm, { keepDefaultValues: true });
          } else {
            // CASE 2: Swap this item with the (non-group) item above it
            console.log('case 2');
            swap(thisIndex, thisIndex - 1);
          }
        } else {
          if (parentIndex >= 0) {
            // CASE 3: This item is the first item in its group, so we need to move it "out"
            // of its group and insert it into it's parent array.
            console.log('case 3');
            const oldForm = cloneDeep(getValues());
            removeItemFromDefinition({
              removeFromPath: parentPath,
              removeFromIndex: 0,
              definition: oldForm as FormDefinitionJson,
            });
            insertItemToDefinition({
              insertPath: grandparentPath,
              insertAtIndex: parentIndex,
              definition: oldForm as FormDefinitionJson,
              item,
            });

            reset(oldForm, { keepDefaultValues: true });
          } // else, this is the first item in the top layer, so hitting the 'up' button does nothing.
        }
      } else if (direction === 'down') {
        if (nextItem) {
          if (nextItem.type === ItemType.Group) {
            // CASE 4: Move this item down into the Group below it
            console.log('case 4');
            const oldForm = cloneDeep(getValues());
            insertItemToDefinition({
              insertPath: nextItemPath,
              insertAtIndex: 0, // prepend to sibling below
              definition: oldForm as FormDefinitionJson,
              item,
            });
            removeItemFromDefinition({
              removeFromPath: parentPath,
              removeFromIndex: thisIndex,
              definition: oldForm as FormDefinitionJson,
            });
            reset(oldForm, { keepDefaultValues: true });
          } else {
            // CASE 5: Swap this item with the (non-group) item below it
            console.log('case 5');
            swap(thisIndex, thisIndex + 1);
          }
        } else {
          if (parentIndex >= 0) {
            // CASE 6: This is the last item at this depth. Move it up into the parent
            console.log('case 6');
            const oldForm = cloneDeep(getValues());

            insertItemToDefinition({
              insertPath: grandparentPath,
              insertAtIndex: parentIndex + 1,
              definition: oldForm as FormDefinitionJson,
              item,
            });
            removeItemFromDefinition({
              removeFromPath: parentPath,
              removeFromIndex: get(oldForm, parentPath).length - 1, // remove the last item
              definition: oldForm as FormDefinitionJson,
            });

            reset(oldForm, { keepDefaultValues: true });
          } // else, this is the last item in the top layer, so hitting the 'down' button does nothing.
        }
      }
    },
    [
      thisIndex,
      thisLayer,
      getValues,
      parentPath,
      prevItemPath,
      reset,
      swap,
      parentIndex,
      grandparentPath,
      nextItem,
      nextItemPath,
      item,
    ]
  );

  return (
    <TreeItem2Label
      sx={{
        display: 'flex',
        alignItems: 'center',
      }}
      key={itemPath}
    >
      {displayAttrs && (
        <Stack direction='row' gap={1}>
          <Box
            component={displayAttrs.IconClass}
            className='labelIcon'
            color='inherit'
            sx={{ fontSize: '1.2rem' }}
          />
          <Typography>{displayAttrs.displayName}:</Typography>
          {labelProps.children}
          {item.required && <Typography color='red'>*</Typography>}
          {<Typography sx={{ color: 'red' }}>{itemPath}</Typography>}
          <IconButton
            aria-label='edit item'
            onClick={(e) => {
              e.stopPropagation();
              onEditButtonClicked(item);
            }}
            disabled={isSubmitting}
            size='small'
            sx={{ color: (theme) => theme.palette.links, p: 0 }}
          >
            <EditIcon fontSize='inherit' />
          </IconButton>
          <Stack direction='column'>
            <IconButton
              aria-label='move item up'
              onClick={(e) => {
                e.stopPropagation();
                onReorder('up');
              }}
              disabled={isSubmitting}
            >
              <UpIcon fontSize='small' />
            </IconButton>
            <IconButton
              aria-label='move item down'
              onClick={(e) => {
                e.stopPropagation();
                onReorder('down');
              }}
              disabled={isSubmitting}
            >
              <DownIcon fontSize='small' />
            </IconButton>
          </Stack>
        </Stack>
      )}
    </TreeItem2Label>
  );
};

export default FormTreeLabel;
