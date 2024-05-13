import { lighten } from '@mui/material';
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
import {
  FormBooleanIcon,
  FormChoiceIcon,
  FormCurrencyIcon,
  FormDateIcon,
  FormDisplayIcon,
  FormFileIcon,
  FormGroupIcon,
  FormImageIcon,
  FormIntegerIcon,
  FormObjectIcon,
  FormStringIcon,
  FormTextIcon,
  FormTimeOfDayIcon,
} from '@/components/elements/SemanticIcons';
import theme from '@/config/theme';
import FormTreeLabel from '@/modules/formBuilder/components/formTree/FormTreeLabel';
import { FormItemDisplay } from '@/modules/formBuilder/components/formTree/types';
import { ItemType } from '@/types/gqlTypes';

const getItemDisplayAttrs = (type: string): FormItemDisplay => {
  const defaultQuestion = {
    // TODO - adjust these colors and make hover color work correctly when designs are finalized
    textColor: theme.palette.success.dark,
    backgroundColor: lighten(theme.palette.success.light, 0.95),
    hoverColor: '',
  };

  // TODO - Show a different icon depending on both item type and component, e.g. dropdown vs. checkbox.
  switch (type) {
    case ItemType.Boolean:
      return { icon: FormBooleanIcon, text: 'CheckBox', ...defaultQuestion };
    case ItemType.Choice:
    case ItemType.OpenChoice:
      return { icon: FormChoiceIcon, text: 'Choice', ...defaultQuestion };
    case ItemType.Currency:
      return { icon: FormCurrencyIcon, text: 'Currency', ...defaultQuestion };
    case ItemType.Date:
      return { icon: FormDateIcon, text: 'Date', ...defaultQuestion };
    case ItemType.Display:
      return { icon: FormDisplayIcon, text: 'Display', ...defaultQuestion };
    case ItemType.File:
      return { icon: FormFileIcon, text: 'File Upload', ...defaultQuestion };
    case ItemType.Group:
      return { icon: FormGroupIcon, text: 'Group', ...defaultQuestion };
    case ItemType.Image:
      return { icon: FormImageIcon, text: 'Image Upload', ...defaultQuestion };
    case ItemType.Integer:
      return { icon: FormIntegerIcon, text: 'Number', ...defaultQuestion };
    case ItemType.Object:
      return { icon: FormObjectIcon, text: '', ...defaultQuestion }; // TODO - How should objects be displayed?
    case ItemType.String:
      return { icon: FormStringIcon, text: 'Text', ...defaultQuestion };
    case ItemType.Text:
      return { icon: FormTextIcon, text: 'Paragraph', ...defaultQuestion };
    case ItemType.TimeOfDay:
      return {
        icon: FormTimeOfDayIcon,
        text: 'Time of Day',
        ...defaultQuestion,
      };
    default:
      return { icon: FormObjectIcon, text: '', ...defaultQuestion };
  }
};

interface FormTreeItemProps
  extends Omit<UseTreeItem2Parameters, 'rootRef'>,
    Omit<React.HTMLAttributes<HTMLLIElement>, 'onFocus'> {}

const FormTreeItem = React.forwardRef(function FormTreeItem(
  props: FormTreeItemProps,
  ref: React.Ref<HTMLLIElement>
) {
  const { id, itemId, label, disabled, children, ...other } = props;

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
  const question = useMemo(() => getItemDisplayAttrs(item.type), [item.type]);

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
              {...getLabelProps({ question })}
              required={item.required}
            />
            <TreeItem2IconContainer
              {...getIconContainerProps()}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                mr: 2,
              }}
            >
              <TreeItem2Icon status={status} />
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
