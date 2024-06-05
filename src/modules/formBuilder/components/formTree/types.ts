import { SvgIconComponent } from '@mui/icons-material';
import { ItemType } from '@/types/gqlTypes';

export type FormItemPaletteType = {
  itemType: ItemType;
  displayName: string;
  IconClass: SvgIconComponent;
  // TODO: either use or remove these colors, depending on design decisions. Perhaps use variants on PaletteCard
  textColor: string;
  backgroundColor: string;
  hoverColor: string;
};
