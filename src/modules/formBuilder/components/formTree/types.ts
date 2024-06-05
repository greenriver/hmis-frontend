import { SvgIconComponent } from '@mui/icons-material';
import { ItemType } from '@/types/gqlTypes';

export type FormItemPaletteType = {
  itemType: ItemType;
  displayName: string;
  IconClass: SvgIconComponent;
};
