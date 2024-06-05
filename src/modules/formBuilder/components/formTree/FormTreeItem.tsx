import { IconButton, Stack } from '@mui/material';
import { Box } from '@mui/system';
import {
  TreeItem2Content,
  TreeItem2GroupTransition,
  TreeItem2Icon,
  TreeItem2IconContainer,
  TreeItem2Provider,
  TreeItem2Root,
  UseTreeItem2Parameters,
} from '@mui/x-tree-view';
import { useTreeItem2 } from '@mui/x-tree-view/useTreeItem2/useTreeItem2';
import React, { useMemo } from 'react';
import { EditIcon } from '@/components/elements/SemanticIcons';
import theme from '@/config/theme';
import { FORM_ITEM_PALETTE } from '@/modules/formBuilder/components/FormBuilderPalette';
import { FormTreeContext } from '@/modules/formBuilder/components/formTree/FormTreeContext';
import FormTreeLabel from '@/modules/formBuilder/components/formTree/FormTreeLabel';
import { FormItemPaletteType } from '@/modules/formBuilder/components/formTree/types';
import { ItemType } from '@/types/gqlTypes';

export const getItemDisplayAttrs = (type: ItemType): FormItemPaletteType => {
  return FORM_ITEM_PALETTE[type];
};

interface FormTreeItemProps
  extends Omit<UseTreeItem2Parameters, 'rootRef'>,
    Omit<React.HTMLAttributes<HTMLLIElement>, 'onFocus'> {}

const FormTreeItem = React.forwardRef(function FormTreeItem(
  props: FormTreeItemProps,
  ref: React.Ref<HTMLLIElement>
) {
  const { id, itemId, label, disabled, children, ...other } = props;

  const { onEditButtonClicked } = React.useContext(FormTreeContext);

  const {
    getRootProps,
    getContentProps,
    getIconContainerProps,
    getLabelProps,
    getGroupTransitionProps,
    status,
    publicAPI,
  } = useTreeItem2({ id, itemId, children, label, disabled, rootRef: ref });

  const item = publicAPI.getItem(itemId);
  const displayAttrs = useMemo(
    () => getItemDisplayAttrs(item.type),
    [item.type]
  );

  // TODO: Add visual tree styling that groups the items together using grey bars (when design is finalized)
  // Should be possible, see example https://mui.com/x/react-tree-view/rich-tree-view/customization/#file-explorer

  // TODO: enable rich text in labels

  return (
    <TreeItem2Provider itemId={itemId}>
      <TreeItem2Root {...getRootProps(other)}>
        <TreeItem2Content
          {...getContentProps()}
          sx={{
            padding: 0,
            marginBottom: theme.spacing(1),
            borderStyle: 'solid',
            borderWidth: 1,
            borderColor: theme.palette.grey[300],
          }}
        >
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
            <FormTreeLabel
              {...getLabelProps({ displayAttrs: displayAttrs })}
              required={item.required}
            />
            <TreeItem2IconContainer
              {...getIconContainerProps()}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                mr: 4,
              }}
            >
              <Stack direction='row'>
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
                <TreeItem2Icon status={status} />
              </Stack>
            </TreeItem2IconContainer>
          </Box>
        </TreeItem2Content>
        {children && (
          <TreeItem2GroupTransition {...getGroupTransitionProps()} />
        )}
      </TreeItem2Root>
    </TreeItem2Provider>
  );
});

export default FormTreeItem;
