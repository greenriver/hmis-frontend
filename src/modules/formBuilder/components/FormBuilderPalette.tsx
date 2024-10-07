import { IconButton, Paper, Tooltip } from '@mui/material';
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
  FormLocationIcon,
  FormObjectIcon,
  FormStringIcon,
  FormTextIcon,
  FormTimeOfDayIcon,
} from '@/components/elements/SemanticIcons';
import {
  CONTEXT_HEADER_HEIGHT,
  STICKY_BAR_HEIGHT,
} from '@/components/layout/layoutConstants';
import { FormItemPaletteType } from '@/modules/formBuilder/types';
import { ItemType } from '@/types/gqlTypes';

// Item types that are excluded from the form builder palette, until we have better support (#6401)
const EXCLUDED_ITEM_TYPES = [
  ItemType.Object,
  ItemType.Image,
  ItemType.File,
  ItemType.Geolocation,
];

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
    displayName: 'Checkbox',
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
  [ItemType.Object]: {
    itemType: ItemType.Object,
    IconClass: FormObjectIcon,
    displayName: 'Object',
  },
  [ItemType.Geolocation]: {
    itemType: ItemType.Geolocation,
    IconClass: FormLocationIcon,
    displayName: 'Geolocation',
  },
};

const PaletteButton: React.FC<
  FormItemPaletteType & { onClick: () => void }
> = ({ displayName, IconClass, onClick }) => {
  return (
    <Tooltip placement='left' title={displayName}>
      <IconButton
        size='small'
        onClick={onClick}
        aria-label={`Add ${displayName} item`}
      >
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
  const top = STICKY_BAR_HEIGHT + CONTEXT_HEADER_HEIGHT;

  return (
    <Paper
      square
      sx={{
        height: `calc(100vh - ${top}px)`,
        position: 'sticky',
        left: 'auto',
        top: top,
        borderTop: 0,
        borderRight: 0,
        boxSizing: 'border-box',
        p: 1,
        pt: 2,
      }}
    >
      <Stack gap={1}>
        {Object.entries(FORM_ITEM_PALETTE)
          .filter(([key]) => !EXCLUDED_ITEM_TYPES.includes(key as ItemType))
          .map(([key, paletteItem]) => (
            <PaletteButton
              key={key}
              {...paletteItem}
              onClick={() => onItemClick(paletteItem.itemType)}
            />
          ))}
      </Stack>
    </Paper>
  );
};

export default FormBuilderPalette;
