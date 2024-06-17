import { Card, Drawer, lighten, Tab, Tabs, Typography } from '@mui/material';
import { Stack } from '@mui/system';
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
import { FormItemPaletteType } from '@/modules/formBuilder/components/formTree/types';
import { ItemType } from '@/types/gqlTypes';

const DEFAULT_PALETTE_ATTRS = {
  textColor: theme.palette.success.dark,
  backgroundColor: lighten(theme.palette.success.light, 0.95),
  hoverColor: '',
};

export const FORM_ITEM_PALETTE = {
  [ItemType.Boolean]: {
    itemType: ItemType.Boolean,
    IconClass: FormBooleanIcon,
    displayName: 'CheckBox',
    ...DEFAULT_PALETTE_ATTRS,
  },
  [ItemType.Choice]: {
    itemType: ItemType.Choice,
    IconClass: FormChoiceIcon,
    displayName: 'Choice',
    ...DEFAULT_PALETTE_ATTRS,
  },
  [ItemType.OpenChoice]: {
    itemType: ItemType.OpenChoice,
    IconClass: FormChoiceIcon,
    displayName: 'Open Choice',
    ...DEFAULT_PALETTE_ATTRS,
  },
  [ItemType.Currency]: {
    itemType: ItemType.Currency,
    IconClass: FormCurrencyIcon,
    displayName: 'Currency',
    ...DEFAULT_PALETTE_ATTRS,
  },
  [ItemType.Date]: {
    itemType: ItemType.Date,
    IconClass: FormDateIcon,
    displayName: 'Date',
    ...DEFAULT_PALETTE_ATTRS,
  },
  [ItemType.Display]: {
    itemType: ItemType.Display,
    IconClass: FormDisplayIcon,
    displayName: 'Display',
    ...DEFAULT_PALETTE_ATTRS,
  },
  [ItemType.File]: {
    itemType: ItemType.File,
    IconClass: FormFileIcon,
    displayName: 'File Upload',
    ...DEFAULT_PALETTE_ATTRS,
  },
  [ItemType.Group]: {
    itemType: ItemType.Group,
    IconClass: FormGroupIcon,
    displayName: 'Group',
    ...DEFAULT_PALETTE_ATTRS,
  },
  [ItemType.Image]: {
    itemType: ItemType.Image,
    IconClass: FormImageIcon,
    displayName: 'Image Upload',
    ...DEFAULT_PALETTE_ATTRS,
  },
  [ItemType.Integer]: {
    itemType: ItemType.Integer,
    IconClass: FormIntegerIcon,
    displayName: 'Number',
    ...DEFAULT_PALETTE_ATTRS,
  },
  [ItemType.Object]: {
    itemType: ItemType.Object,
    IconClass: FormObjectIcon,
    displayName: 'Object',
    ...DEFAULT_PALETTE_ATTRS,
  }, // TODO: how should objects be displayed?
  [ItemType.String]: {
    itemType: ItemType.String,
    IconClass: FormStringIcon,
    displayName: 'Text',
    ...DEFAULT_PALETTE_ATTRS,
  },
  [ItemType.Text]: {
    itemType: ItemType.Text,
    IconClass: FormTextIcon,
    displayName: 'Paragraph',
    ...DEFAULT_PALETTE_ATTRS,
  },
  [ItemType.TimeOfDay]: {
    itemType: ItemType.TimeOfDay,
    IconClass: FormTimeOfDayIcon,
    displayName: 'Time of Day',
    ...DEFAULT_PALETTE_ATTRS,
  },
};

const PaletteCard: React.FC<FormItemPaletteType & { onClick: () => void }> = ({
  displayName,
  IconClass,
  backgroundColor,
  onClick,
}) => {
  return (
    <Card sx={{ p: 2, backgroundColor: backgroundColor }} onClick={onClick}>
      <Stack gap={1} direction='row'>
        <IconClass />
        {displayName}
      </Stack>
    </Card>
  );
};

interface FormBuilderPaletteType {
  onItemClick: (itemType: ItemType) => void;
}

const FormBuilderPalette: React.FC<FormBuilderPaletteType> = ({
  onItemClick,
}) => {
  // TODO - control drawer open and close - TBD if we will just leave it open, discuss w/ design
  // const [drawerOpen, setDrawerOpen] = useState(true);
  const drawerWidth = 240;

  return (
    <Drawer
      variant='persistent'
      open={true}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          position: 'static',
          borderTop: 'none',
          boxSizing: 'border-box',
          p: 2,
        },
      }}
    >
      <Typography variant='cardTitle'>Form Elements</Typography>
      <Tabs
        sx={{
          mb: 2,
          '&. MuiTab-root': { p: 0, minWidth: 0 },
        }}
        value={0}
        onChange={() => {}}
        aria-label='basic tabs example'
      >
        <Tab label='Basic' />
        <Tab label='Hud' />
        <Tab label='Custom' />
      </Tabs>
      <Stack gap={1}>
        {Object.entries(FORM_ITEM_PALETTE).map(([key, paletteItem]) => (
          <PaletteCard
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
