import { SvgIconComponent } from '@mui/icons-material';
import { FormItem, ItemType } from '@/types/gqlTypes';

export type FormItemPaletteType = {
  itemType: ItemType;
  displayName: string;
  IconClass: SvgIconComponent;
};

export type ItemDependents = {
  enableWhenDependents: FormItem[];
  autofillDependents: FormItem[];
  boundDependents: FormItem[];
};
