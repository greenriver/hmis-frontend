import { IconButton, List, ListItem, Typography } from '@mui/material';
import { Box, Stack, Theme } from '@mui/system';
import { TreeItem2Label, UseTreeItem2Parameters } from '@mui/x-tree-view';
import { useTreeItem2 } from '@mui/x-tree-view/useTreeItem2/useTreeItem2';
import { UseTreeItem2LabelSlotProps } from '@mui/x-tree-view/useTreeItem2/useTreeItem2.types';
import React, { useContext, useMemo, useState } from 'react';
import { useFormContext, useFormState } from 'react-hook-form';
import { FormTreeContext } from './FormTreeContext';
import useUpdateFormStructure from './useUpdateFormStructure';
import CommonMenuButton from '@/components/elements/CommonMenuButton';
import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import {
  ConditionalIcon,
  DownIcon,
  UpIcon,
} from '@/components/elements/SemanticIcons';
import { FORM_ITEM_PALETTE } from '@/modules/formBuilder/components/FormBuilderPalette';
import { displayLabelForItem } from '@/modules/formBuilder/formBuilderUtil';
import {
  FormItemPaletteType,
  ItemDependents,
} from '@/modules/formBuilder/types';
import { ItemType } from '@/types/gqlTypes';

export const getItemDisplayAttrs = (type: ItemType): FormItemPaletteType => {
  return FORM_ITEM_PALETTE[type];
};

export interface FormTreeLabelProps
  extends UseTreeItem2LabelSlotProps,
    Omit<UseTreeItem2Parameters, 'children'> {
  itemId: string;
}

const dependentLabelMap: Record<string, string> = {
  autofillDependents: 'Items with autofill condition(s)',
  enableWhenDependents: 'Items with visibility condition(s)',
  boundDependents: 'Items with min/max bound(s)',
};

const FormTreeLabel: React.FC<FormTreeLabelProps> = ({
  id,
  itemId,
  label,
  disabled,
  children,
}) => {
  const { openFormItemEditor, itemMap, rhfPathMap, expandItem } =
    useContext(FormTreeContext);

  const { control } = useFormContext();

  const { isSubmitting } = useFormState({ control });

  const { getLabelProps } = useTreeItem2({
    id,
    itemId,
    children,
    label,
    disabled,
  });

  const item = useMemo(() => itemMap[itemId], [itemMap, itemId]);

  const displayAttrs = useMemo(
    () => getItemDisplayAttrs(item?.type),
    [item?.type]
  );

  const labelProps = getLabelProps();

  const { onReorder, onDelete, canMoveUp, canMoveDown } =
    useUpdateFormStructure(
      control,
      itemId,
      item,
      itemMap,
      rhfPathMap,
      expandItem
    );

  const [itemDependents, setItemDependents] = useState<
    ItemDependents | undefined
  >(undefined);

  const menuItems = useMemo(
    () => [
      {
        key: 'edit',
        title: 'Edit',
        onClick: () => openFormItemEditor(item),
      },
      {
        key: 'delete',
        title: 'Delete',
        onClick: () => onDelete(setItemDependents),
      },
    ],
    [item, openFormItemEditor, onDelete]
  );

  return (
    <TreeItem2Label
      key={itemId}
      sx={{
        display: 'flex',
        alignItems: 'center',
        fontWeight: 600,
        height: '48px',
      }}
    >
      {!!itemDependents && (
        <ConfirmationDialog
          open={!!itemDependents}
          title='Cannot delete item'
          onConfirm={() => setItemDependents(undefined)}
          loading={false}
        >
          "{displayLabelForItem(item)}" cannot be deleted because it is
          referenced elsewhere.
          {Object.entries(itemDependents).map(([key, val]) =>
            val.length > 0 ? (
              <Box sx={{ mt: 1 }} key={key}>
                {dependentLabelMap[key]}:
                <List>
                  {val.map((dep) => (
                    <ListItem key={dep.linkId}>{`"${displayLabelForItem(
                      dep
                    )}"`}</ListItem>
                  ))}
                </List>
              </Box>
            ) : null
          )}
          All references to this item must be removed before it can be deleted.
        </ConfirmationDialog>
      )}
      {displayAttrs && (
        <Stack
          direction='row'
          gap={1}
          alignItems='center'
          sx={{
            width: '100%', // for text overflow to work for long labels
            pr: 12, // to account for actions
          }}
        >
          <Box
            component={displayAttrs.IconClass}
            className='labelIcon'
            color='inherit'
            sx={{ fontSize: '1.2rem' }}
          />
          <Typography>{displayAttrs.displayName}:</Typography>
          <Box
            component='span'
            sx={{
              // Truncate long labels
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {labelProps.children}
          </Box>

          {item.required && <Typography color='red'>*</Typography>}
          {item.enableWhen && item.enableWhen?.length > 0 && (
            <ConditionalIcon
              fontSize='inherit'
              color='secondary'
              sx={{ ml: 1, fontSize: '12' }}
            />
          )}

          {/* {<Typography sx={{ color: 'red' }}>{itemPath}</Typography>} */}
          <Stack
            sx={{ position: 'absolute', right: 0 }}
            direction='row'
            alignItems='center'
            gap={1}
          >
            <CommonMenuButton
              title='Actions'
              aria-label='item actions'
              iconButton
              items={menuItems}
              variant='outlined'
              sx={{
                color: (theme: Theme) => theme.palette.links,
                height: '28px',
                width: '28px',
              }}
              MenuProps={{
                sx: {
                  '.MuiPopover-paper': { minWidth: '180px' },
                },
              }}
            />
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
        </Stack>
      )}
    </TreeItem2Label>
  );
};

export default FormTreeLabel;
