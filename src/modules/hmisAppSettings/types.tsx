import { ThemeOptions } from '@mui/material';
export interface HmisAppSettings {
  oktaPath?: string;
  logoPath?: string;
  logo?: HTMLImageElement;
  warehouseUrl?: string;
  warehouseName?: string;
  resetPasswordUrl?: string;
  unlockAccountUrl?: string;
  manageAccountUrl?: string;
  casUrl?: string;
  appName?: string;
  theme?: ThemeOptions;
}
