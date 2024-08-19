import { IconButton, Typography } from '@mui/material';
import { Box, Stack, Theme } from '@mui/system';
import { TreeItem2Label, UseTreeItem2Parameters } from '@mui/x-tree-view';
import { useTreeItem2 } from '@mui/x-tree-view/useTreeItem2/useTreeItem2';
import { UseTreeItem2LabelSlotProps } from '@mui/x-tree-view/useTreeItem2/useTreeItem2.types';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext, useFormState } from 'react-hook-form';
import { FormTreeContext } from './FormTreeContext';
import useUpdateFormStructure from './useUpdateFormStructure';
import CommonMenuButton from '@/components/elements/CommonMenuButton';
import {
  ConditionalIcon,
  DownIcon,
  UpIcon,
} from '@/components/elements/SemanticIcons';
import { FORM_ITEM_PALETTE } from '@/modules/formBuilder/components/FormBuilderPalette';
import CannotDeleteItemDialog from '@/modules/formBuilder/components/formTree/CannotDeleteItemDialog';
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

const FormTreeLabel: React.FC<FormTreeLabelProps> = ({
  id,
  itemId,
  label,
  disabled,
  children,
}) => {
  const {
    openFormItemEditor,
    itemMap,
    rhfPathMap,
    ancestorLinkIdMap,
    expandItem,
    focusedTreeButton,
    setFocusedTreeButton,
  } = useContext(FormTreeContext);

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

  const upRef = useRef<HTMLButtonElement | null>(null);
  const downRef = useRef<HTMLButtonElement | null>(null);

  // When the user reorders form items, we want to maintain focus on the up/down button in question. But, since some
  // form reorder actions use rhf's `reset` on the whole structure, this refocus lives here in this useEffect.
  useEffect(() => {
    if (focusedTreeButton === `${itemId}-up`) {
      upRef.current?.focus();
    } else if (focusedTreeButton === `${itemId}-down`) {
      downRef.current?.focus();
    }
  }, [itemId, upRef, downRef, focusedTreeButton]);

  const { onReorder, onDelete, canMoveUp, canMoveDown } =
    useUpdateFormStructure(
      control,
      itemId,
      item,
      itemMap,
      rhfPathMap,
      expandItem
    );

  // deletionBlockers contains the dependent items that block the deletion action currently being attempted.
  // Gets reset to `undefined` when the user closes the error modal.
  const [deletionBlockers, setDeletionBlockers] = useState<
    ItemDependents | undefined
  >(undefined);

  const menuItems = useMemo(
    () => [
      {
        key: 'edit',
        title: 'Edit',
        onClick: () => openFormItemEditor(item),
        ariaLabel: `edit ${itemId}`,
      },
      {
        key: 'delete',
        title: 'Delete',
        onClick: () => onDelete(setDeletionBlockers),
        // disable deletion for groups that contain items
        disabled:
          item?.type === ItemType.Group && !!item?.item && item.item.length > 0,
        ariaLabel: `delete ${itemId}`,
      },
    ],
    [item, openFormItemEditor, onDelete, itemId]
  );

  return (
    <TreeItem2Label
      key={itemId}
      aria-label={`item ${itemId}`}
      sx={{
        display: 'flex',
        alignItems: 'center',
        fontWeight: 600,
        height: '48px',
      }}
    >
      {!!deletionBlockers && (
        <CannotDeleteItemDialog
          item={item}
          itemMap={itemMap}
          deletionBlockers={deletionBlockers}
          setDeletionBlockers={setDeletionBlockers}
          ancestorLinkIdMap={ancestorLinkIdMap}
        />
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
              aria-label={`${itemId} item actions`}
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
                aria-label={`${itemId} move up`}
                onClick={(e) => {
                  e.stopPropagation();
                  onReorder('up');
                  setFocusedTreeButton(`${itemId}-up`);
                }}
                disabled={isSubmitting || !canMoveUp}
                ref={upRef}
              >
                <UpIcon />
              </IconButton>
              <IconButton
                aria-label={`${itemId} move down`}
                onClick={(e) => {
                  e.stopPropagation();
                  onReorder('down');
                  setFocusedTreeButton(`${itemId}-down`);
                }}
                disabled={isSubmitting || !canMoveDown}
                ref={downRef}
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
