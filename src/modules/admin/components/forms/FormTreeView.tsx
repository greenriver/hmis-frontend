import { SvgIconComponent } from '@mui/icons-material';
import { Badge, lighten, Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import {
  TreeItem2Content,
  TreeItem2GroupTransition,
  TreeItem2Icon,
  TreeItem2IconContainer,
  TreeItem2Label,
  TreeItem2Provider,
  TreeItem2Root,
  UseTreeItem2Parameters,
} from '@mui/x-tree-view';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { useTreeItem2 } from '@mui/x-tree-view/useTreeItem2/useTreeItem2';
import React, { useMemo } from 'react';
import Loading from '@/components/elements/Loading';
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
import { FormDefinitionJson, ItemType } from '@/types/gqlTypes';

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

interface FormTreeLabelProps {
  children?: React.ReactNode;
  question?: FormItemDisplay;
  required?: boolean;
}
const FormTreeLabel: React.FC<FormTreeLabelProps> = ({
  question,
  children,
  required,
  ...other
}) => {
  return (
    <TreeItem2Label
      {...other}
      sx={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {question && (
        <Badge
          invisible={!required}
          badgeContent={'*'}
          sx={{
            '& .MuiBadge-badge': {
              fontWeight: 700,
              color: theme.palette.error.main,
              backgroundColor: theme.palette.background.default,
              borderStyle: 'solid',
              borderWidth: 1,
              borderColor: theme.palette.borders.dark,
              transform: 'scale(1) translate(-30%, -30%)',
              // TODO: weird visual interaction with required badge when the Tree elements are expanded/contracted
            },
          }}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <Stack
            sx={{
              width: 90,
              alignItems: 'center',
              color: question.textColor,
              backgroundColor: question.backgroundColor,
              borderRadius: '4px 0 0 4px',
              mr: 2,
              p: 1, // TODO - This styling is inflexible, looks bad when the label text is long
            }}
          >
            <Box
              component={question.icon}
              className='labelIcon'
              color='inherit'
              sx={{ fontSize: '1.2rem' }}
            />
            <Typography variant='caption'>{question.text}</Typography>
          </Stack>
        </Badge>
      )}
      {children}
    </TreeItem2Label>
  );
};

interface FormItemDisplay {
  icon: SvgIconComponent;
  text: string;
  backgroundColor: string;
  textColor: string;
  hoverColor: string;
}

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
  const question = getItemDisplayAttrs(item.type);

  // TODO: Add visual tree styling that groups the items together using grey bars.
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

interface FormTreeViewProps {
  definition: FormDefinitionJson;
}
const FormTreeView: React.FC<FormTreeViewProps> = ({ definition }) => {
  // TODO - let's discuss the best way to support nesting
  // MUI tree view component expects the 'item' prop to be named 'children', and doesn't provide an overrider function.
  // OS contribution to react mui that provides an override? (but maybe there's a reason they don't allow)
  // rewriting our DSL to use 'children' instead of 'item'? (but this feels like big lift + bad coupling)
  // keep and clean up the below adapter, expanding it to n layers of nesting (n = 5?) ?
  // We might need something like this adapter anyway to consolidate down some functional groups, like SSN
  const definitionForTree = useMemo(() => {
    if (!definition?.item) return [];
    return definition.item.map((i) => {
      return {
        ...i,
        children: i.item?.map((j) => {
          return {
            ...j,
            children: j.item?.map((k) => {
              return { ...k, children: k.item };
            }),
          };
        }),
      };
    });
  }, [definition]);

  if (!definition) return <Loading />;

  return (
    <RichTreeView
      aria-label='form tree view'
      disableSelection
      items={definitionForTree}
      getItemId={(item) => item.linkId}
      getItemLabel={(item) => item.text || item.helperText || item.linkId}
      slots={{ item: FormTreeItem }}
      onItemFocus={(_event, itemId) => {
        // TODO - add node onclick handler
        console.log(itemId);
      }}
    />
  );
};

export default FormTreeView;
