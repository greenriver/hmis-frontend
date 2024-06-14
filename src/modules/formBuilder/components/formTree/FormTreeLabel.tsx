import EditIcon from '@mui/icons-material/Edit';
import { IconButton, Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { TreeItem2Label, UseTreeItem2Parameters } from '@mui/x-tree-view';
import { useTreeItem2 } from '@mui/x-tree-view/useTreeItem2/useTreeItem2';
import { UseTreeItem2LabelSlotProps } from '@mui/x-tree-view/useTreeItem2/useTreeItem2.types';
import React, { useCallback, useMemo } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { DownIcon, UpIcon } from '@/components/elements/SemanticIcons';
import { FORM_ITEM_PALETTE } from '@/modules/formBuilder/components/FormBuilderPalette';
import { FormTreeContext } from '@/modules/formBuilder/components/formTree/FormTreeContext';
import { getItemFromTree } from '@/modules/formBuilder/components/formTree/formTreeUtil';
import { FormItemPaletteType } from '@/modules/formBuilder/components/formTree/types';
import { getPathContext } from '@/modules/formBuilder/formBuilderUtil';
import { ItemType } from '@/types/gqlTypes';

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

  const { onEditButtonClicked, itemIdMap } = React.useContext(FormTreeContext);

  const { control, getValues } = useFormContext();

  const itemPath = itemIdMap[itemId];

  const { parentPath, index: thisIndex } = getPathContext(itemPath);
  const { parentPath: grandparentPath, index: parentIndex } =
    getPathContext(parentPath);

  // TODO(#6094) - There may be a better way to keep Typescript happy than casting `as any` here.
  //  See https://react-hook-form.com/docs/usefieldarray, search "Typescript".
  //  (Also search other usages of `as any` in this file)
  const thisLayer = getValues(parentPath as any);

  const { fields, remove, swap } = useFieldArray({
    control,
    name: parentPath as any,
  });

  const { insert: insertInParent } = useFieldArray({
    control,
    name: grandparentPath as any,
  });

  const prevItem = thisLayer[thisIndex - 1];
  const prevLinkId = prevItem?.linkId || '';
  const prevItemPath = prevLinkId ? itemIdMap[prevLinkId] + '.item' : '';

  const { append: appendToPrevious } = useFieldArray({
    control,
    name: prevItemPath as any,
  });

  const nextItem = thisLayer[thisIndex + 1];
  const nextLinkId = nextItem?.linkId || '';
  const nextItemPath = nextLinkId ? itemIdMap[nextLinkId] + '.item' : '';

  const { prepend: prependToNext } = useFieldArray({
    control,
    name: nextItemPath as any,
  });

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

  // TODO(#6094) - Limit nesting depth to 5
  // TODO(#6094) - Auto open a group when an item is moved into it.
  //  This involves turning Mui Tree's expandedItems into a controlled prop - see https://github.com/greenriver/hmis-frontend/pull/797
  const onReorder = useCallback(
    (direction: 'up' | 'down') => {
      if (direction === 'up') {
        if (thisIndex > 0) {
          const prevItem = thisLayer[thisIndex - 1];
          console.log('onReorder: this layer', thisLayer);
          console.log('onReorder: fields', fields);

          if (prevItem.type === ItemType.Group) {
            // CASE 1: Move this item up into the Group above it
            // TODO(#6094) - `remove` is causing issues, though `append`, `insert`, and `swap` all seem to be working OK
            remove(thisIndex);
            appendToPrevious({ ...item, linkId: 'b1' });
          } else {
            // CASE 2: Swap this item with the (non-group) item above it
            swap(thisIndex, thisIndex - 1);
          }
        } else {
          if (parentIndex >= 0) {
            // CASE 3: This is the first item at this depth. Move it up into the parent
            remove(thisIndex);
            insertInParent(parentIndex, item);
          } // else, this is the first item in the top layer, so hitting the 'up' button does nothing.
        }
      } else if (direction === 'down') {
        if (nextItem) {
          if (nextItem.type === ItemType.Group) {
            // CASE 4: Move this item down into the Group below it
            remove(thisIndex);
            prependToNext(item);
          } else {
            // CASE 5: Swap this item with the (non-group) item below it
            swap(thisIndex, thisIndex + 1);
          }
        } else {
          if (parentIndex >= 0) {
            // CASE 6: This is the last item at this depth. Move it up into the parent
            remove(thisIndex);
            insertInParent(parentIndex + 1, item);
          } // else, this is the last item in the top layer, so hitting the 'down' button does nothing.
        }
      }
    },
    [
      thisIndex,
      thisLayer,
      fields,
      remove,
      appendToPrevious,
      item,
      swap,
      parentIndex,
      insertInParent,
      nextItem,
      prependToNext,
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
          <IconButton
            aria-label='edit item'
            onClick={(e) => {
              e.stopPropagation();
              onEditButtonClicked(item);
            }}
            size='small'
            sx={{ color: (theme) => theme.palette.links, p: 0 }}
          >
            <EditIcon fontSize='inherit' />
          </IconButton>
          <Stack direction='column'>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onReorder('up');
              }}
            >
              <UpIcon fontSize='small' />
            </IconButton>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onReorder('down');
              }}
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
