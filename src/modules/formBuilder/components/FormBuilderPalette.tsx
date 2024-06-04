import { Drawer, IconButton, Tooltip } from '@mui/material';
import { Stack } from '@mui/system';
import {
  FormBooleanIcon,
  FormChoiceIcon,
  FormCurrencyIcon,
  FormDateIcon,
  FormDisplayIcon,
  FormDropdownIcon,
  FormFileIcon,
  FormGroupIcon,
  FormImageIcon,
  FormIntegerIcon,
  FormStringIcon,
  FormTextIcon,
  FormTimeOfDayIcon,
} from '@/components/elements/SemanticIcons';
import {
  CONTEXT_HEADER_HEIGHT,
  STICKY_BAR_HEIGHT,
} from '@/components/layout/layoutConstants';
import { FormItemPaletteType } from '@/modules/formBuilder/components/formTree/types';
import { ItemType } from '@/types/gqlTypes';

export const FORM_ITEM_PALETTE = {
  [ItemType.Group]: {
    itemType: ItemType.Group,
    IconClass: FormGroupIcon,
    displayName: 'Group',
  },
  [ItemType.Display]: {
    itemType: ItemType.Display,
    IconClass: FormDisplayIcon,
    displayName: 'Display',
  },
  [ItemType.String]: {
    itemType: ItemType.String,
    IconClass: FormStringIcon,
    displayName: 'Text',
  },
  [ItemType.Text]: {
    itemType: ItemType.Text,
    IconClass: FormTextIcon,
    displayName: 'Paragraph',
  },
  [ItemType.Integer]: {
    itemType: ItemType.Integer,
    IconClass: FormIntegerIcon,
    displayName: 'Number',
  },
  [ItemType.Currency]: {
    itemType: ItemType.Currency,
    IconClass: FormCurrencyIcon,
    displayName: 'Currency',
  },
  [ItemType.Date]: {
    itemType: ItemType.Date,
    IconClass: FormDateIcon,
    displayName: 'Date',
  },
  [ItemType.TimeOfDay]: {
    itemType: ItemType.TimeOfDay,
    IconClass: FormTimeOfDayIcon,
    displayName: 'Time of Day',
  },
  [ItemType.Boolean]: {
    itemType: ItemType.Boolean,
    IconClass: FormBooleanIcon,
    displayName: 'CheckBox',
  },
  [ItemType.Choice]: {
    itemType: ItemType.Choice,
    IconClass: FormChoiceIcon,
    displayName: 'Choice',
  },
  [ItemType.OpenChoice]: {
    itemType: ItemType.OpenChoice,
    IconClass: FormDropdownIcon,
    displayName: 'Open Choice',
  },
  [ItemType.Image]: {
    itemType: ItemType.Image,
    IconClass: FormImageIcon,
    displayName: 'Image Upload',
  },
  [ItemType.File]: {
    itemType: ItemType.File,
    IconClass: FormFileIcon,
    displayName: 'File Upload',
  },
  // TODO - Object is a special case, remove it from the list for now until we support it
  // [ItemType.Object]: {
  //   itemType: ItemType.Object,
  //   IconClass: FormObjectIcon,
  //   displayName: 'Object',
  // },
};

const PaletteButton: React.FC<
  FormItemPaletteType & { onClick: () => void }
> = ({ displayName, IconClass, onClick }) => {
  return (
    <Tooltip placement='left' title={displayName}>
      <IconButton size='small' onClick={onClick}>
        <IconClass />
      </IconButton>
    </Tooltip>
  );
};

interface FormBuilderPaletteType {
  onItemClick: (itemType: ItemType) => void;
}

const FormBuilderPalette: React.FC<FormBuilderPaletteType> = ({
  onItemClick,
}) => {
  return (
    <Drawer
      variant='persistent'
      open={true}
      sx={{
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          height: `calc(100vh - ${
            STICKY_BAR_HEIGHT + CONTEXT_HEADER_HEIGHT
          }px)`,
          position: 'static',
          borderTop: 'none',
          boxSizing: 'border-box',
          p: 1,
          pt: 2,
        },
      }}
    >
      <Stack gap={1}>
        {Object.entries(FORM_ITEM_PALETTE).map(([key, paletteItem]) => (
          <PaletteButton
            key={key}
            {...paletteItem}
            onClick={() => onItemClick(paletteItem.itemType)}
          />
        ))}
      </Stack>
    </Drawer>
  );
};

export default FormBuilderPalette;
