import EditIcon from '@mui/icons-material/Edit';
import { IconButton, Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { TreeItem2Label, UseTreeItem2Parameters } from '@mui/x-tree-view';
import { useTreeItem2 } from '@mui/x-tree-view/useTreeItem2/useTreeItem2';
import { UseTreeItem2LabelSlotProps } from '@mui/x-tree-view/useTreeItem2/useTreeItem2.types';
import React, { useMemo } from 'react';
import { useFormContext, useFormState } from 'react-hook-form';
import useReorderItem from './useReorderItem';
import { DownIcon, UpIcon } from '@/components/elements/SemanticIcons';
import { FORM_ITEM_PALETTE } from '@/modules/formBuilder/components/FormBuilderPalette';
import { FormTreeContext } from '@/modules/formBuilder/components/formTree/FormTreeContext';
import { getItemFromTree } from '@/modules/formBuilder/components/formTree/formTreeUtil';
import { FormItemPaletteType } from '@/modules/formBuilder/components/formTree/types';
import { ItemType } from '@/types/gqlTypes';

export const getItemDisplayAttrs = (type: ItemType): FormItemPaletteType => {
  return FORM_ITEM_PALETTE[type];
};

export interface FormTreeLabelProps
  extends UseTreeItem2LabelSlotProps,
    Omit<UseTreeItem2Parameters, 'children'> {
  itemId: string;
}

const FormTreeLabel: React.FC<FormTreeLabelProps> = ({
  id,
  itemId,
  label,
  disabled,
  children,
}) => {
  const { openFormItemEditor } = React.useContext(FormTreeContext);

  const { control } = useFormContext();
  const { isSubmitting } = useFormState({ control });

  const { getLabelProps, publicAPI } = useTreeItem2({
    id,
    itemId,
    children,
    label,
    disabled,
  });

  // we could get this from the form instead of from the tree api
  const treeItem = publicAPI.getItem(itemId);
  const item = useMemo(() => getItemFromTree(treeItem), [treeItem]);

  const displayAttrs = useMemo(
    () => getItemDisplayAttrs(item.type),
    [item.type]
  );

  const labelProps = getLabelProps();

  const { onReorder, canMoveUp, canMoveDown } = useReorderItem(
    control,
    itemId,
    item
  );

  return (
    <TreeItem2Label
      sx={{
        display: 'flex',
        alignItems: 'center',
        fontWeight: 600,
      }}
      key={itemId} // does this need to be path for remounting to work right?
    >
      {displayAttrs && (
        <Stack direction='row' gap={1} alignItems='center'>
          <Box
            component={displayAttrs.IconClass}
            className='labelIcon'
            color='inherit'
            sx={{ fontSize: '1.2rem' }}
          />
          <Typography>{displayAttrs.displayName}:</Typography>
          {labelProps.children}
          {item.required && <Typography color='red'>*</Typography>}
          {/* {<Typography sx={{ color: 'red' }}>{itemPath}</Typography>} */}
          <IconButton
            aria-label='edit item'
            onClick={(e) => {
              e.stopPropagation();
              openFormItemEditor(item);
            }}
            disabled={isSubmitting}
            size='small'
            sx={{ ml: 2, color: (theme) => theme.palette.links }}
          >
            <EditIcon fontSize='inherit' />
          </IconButton>
          <Stack
            direction='column'
            sx={{ '.MuiIconButton-root': { height: '24px', width: '24px' } }}
          >
            <IconButton
              aria-label='move item up'
              onClick={(e) => {
                e.stopPropagation();
                onReorder('up');
              }}
              disabled={isSubmitting || !canMoveUp}
            >
              <UpIcon />
            </IconButton>
            <IconButton
              aria-label='move item down'
              onClick={(e) => {
                e.stopPropagation();
                onReorder('down');
              }}
              disabled={isSubmitting || !canMoveDown}
            >
              <DownIcon />
            </IconButton>
          </Stack>
        </Stack>
      )}
    </TreeItem2Label>
  );
};

export default FormTreeLabel;
